const express = require('express');
const { query } = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Send message
router.post('/',
  authenticateToken,
  validate(schemas.messageCreate),
  async (req, res) => {
    try {
      const { destinataireId, contenu } = req.body;
      const expediteurId = req.user.id;

      // Check if recipient exists
      const [recipient] = await query(
        'SELECT id, nom FROM utilisateur WHERE id = ?',
        [destinataireId]
      );

      if (!recipient.length) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      // Don't allow sending message to yourself
      if (destinataireId === expediteurId) {
        return res.status(400).json({ error: 'Cannot send message to yourself' });
      }

      const sql = `
        INSERT INTO message (expediteurId, destinataireId, contenu, createdAt)
        VALUES (?, ?, ?, NOW(3))
      `;

      const result = await query(sql, [expediteurId, destinataireId, contenu]);

      // Get created message with sender and recipient details
      const [message] = await query(`
        SELECT m.*, 
               u1.nom as expediteurNom, u1.email as expediteurEmail,
               u2.nom as destinataireNom, u2.email as destinataireEmail
        FROM message m
        JOIN utilisateur u1 ON m.expediteurId = u1.id
        JOIN utilisateur u2 ON m.destinataireId = u2.id
        WHERE m.id = ?
      `, [result.insertId]);

      res.status(201).json({
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

// Get conversations (list of users you have messages with)
router.get('/conversations',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const sql = `
        SELECT DISTINCT 
          CASE 
            WHEN m.expediteurId = ? THEN m.destinataireId 
            ELSE m.expediteurId 
          END as otherUserId,
          u.nom as otherUserName, u.email as otherUserEmail,
          MAX(m.createdAt) as lastMessageTime,
          (SELECT contenu FROM message 
           WHERE ((expediteurId = ? AND destinataireId = otherUserId) OR 
                  (expediteurId = otherUserId AND destinataireId = ?))
           ORDER BY createdAt DESC LIMIT 1) as lastMessage,
          (SELECT COUNT(*) FROM message 
           WHERE destinataireId = ? AND expediteurId = otherUserId AND lu = 0) as unreadCount
        FROM message m
        JOIN utilisateur u ON (
          CASE 
            WHEN m.expediteurId = ? THEN m.destinataireId = u.id 
            ELSE m.expediteurId = u.id 
          END
        )
        WHERE (m.expediteurId = ? OR m.destinataireId = ?)
        GROUP BY otherUserId, u.nom, u.email
        ORDER BY lastMessageTime DESC
        LIMIT ? OFFSET ?
      `;

      const conversations = await query(sql, [
        userId, userId, userId, userId, userId, userId, userId, limit, offset
      ]);

      // Get total count
      const countSql = `
        SELECT COUNT(DISTINCT 
          CASE 
            WHEN m.expediteurId = ? THEN m.destinataireId 
            ELSE m.expediteurId 
          END
        ) as total
        FROM message m
        WHERE (m.expediteurId = ? OR m.destinataireId = ?)
      `;
      const [{ total }] = await query(countSql, [userId, userId, userId]);

      res.json({
        conversations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }
);

// Get messages with a specific user
router.get('/conversation/:userId',
  authenticateToken,
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const otherUserId = parseInt(req.params.userId);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      // Check if other user exists
      const [otherUser] = await query(
        'SELECT id, nom, email FROM utilisateur WHERE id = ?',
        [otherUserId]
      );

      if (!otherUser.length) {
        return res.status(404).json({ error: 'User not found' });
      }

      const sql = `
        SELECT m.*, 
               u1.nom as expediteurNom, u1.email as expediteurEmail,
               u2.nom as destinataireNom, u2.email as destinataireEmail
        FROM message m
        JOIN utilisateur u1 ON m.expediteurId = u1.id
        JOIN utilisateur u2 ON m.destinataireId = u2.id
        WHERE ((m.expediteurId = ? AND m.destinataireId = ?) OR 
               (m.expediteurId = ? AND m.destinataireId = ?))
        ORDER BY m.createdAt ASC
        LIMIT ? OFFSET ?
      `;

      const messages = await query(sql, [
        currentUserId, otherUserId, otherUserId, currentUserId, limit, offset
      ]);

      // Get total count
      const countSql = `
        SELECT COUNT(*) as total
        FROM message m
        WHERE ((m.expediteurId = ? AND m.destinataireId = ?) OR 
               (m.expediteurId = ? AND m.destinataireId = ?))
      `;
      const [{ total }] = await query(countSql, [
        currentUserId, otherUserId, otherUserId, currentUserId
      ]);

      res.json({
        messages,
        otherUser: otherUser[0],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  }
);

// Mark messages as read
router.put('/conversation/:userId/read',
  authenticateToken,
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const otherUserId = parseInt(req.params.userId);

      // Update all unread messages from other user to current user as read
      const result = await query(`
        UPDATE message 
        SET lu = 1 
        WHERE expediteurId = ? AND destinataireId = ? AND lu = 0
      `, [otherUserId, currentUserId]);

      res.json({
        message: 'Messages marked as read',
        count: result.affectedRows
      });
    } catch (error) {
      console.error('Mark messages as read error:', error);
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  }
);

// Delete message
router.delete('/:id',
  authenticateToken,
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if message exists and user is either sender or recipient
      const [message] = await query(
        'SELECT * FROM message WHERE id = ? AND (expediteurId = ? OR destinataireId = ?)',
        [id, userId, userId]
      );

      if (!message.length) {
        return res.status(404).json({ error: 'Message not found or access denied' });
      }

      // Delete message
      await query('DELETE FROM message WHERE id = ?', [id]);

      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  }
);

// Get unread messages count
router.get('/unread/count',
  authenticateToken,
  async (req, res) => {
    try {
      const [result] = await query(
        'SELECT COUNT(*) as count FROM message WHERE destinataireId = ? AND lu = 0',
        [req.user.id]
      );

      res.json({ unreadCount: result.count });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  }
);

// Search messages
router.get('/search',
  authenticateToken,
  async (req, res) => {
    try {
      const { q: query, userId } = req.query;
      const currentUserId = req.user.id;

      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      let whereClause = `
        WHERE ((m.expediteurId = ? AND m.destinataireId = ?) OR 
               (m.expediteurId = ? AND m.destinataireId = ?))
        AND m.contenu LIKE ?
      `;
      const params = [currentUserId, userId, userId, currentUserId, `%${query}%`];

      if (!userId) {
        // Search in all conversations
        whereClause = `
          WHERE (m.expediteurId = ? OR m.destinataireId = ?)
          AND m.contenu LIKE ?
        `;
        params = [currentUserId, currentUserId, `%${query}%`];
      }

      const sql = `
        SELECT m.*, 
               u1.nom as expediteurNom, u1.email as expediteurEmail,
               u2.nom as destinataireNom, u2.email as destinataireEmail
        FROM message m
        JOIN utilisateur u1 ON m.expediteurId = u1.id
        JOIN utilisateur u2 ON m.destinataireId = u2.id
        ${whereClause}
        ORDER BY m.createdAt DESC
        LIMIT 50
      `;

      const messages = await query(sql, params);

      res.json({ messages });
    } catch (error) {
      console.error('Search messages error:', error);
      res.status(500).json({ error: 'Failed to search messages' });
    }
  }
);

module.exports = router;
