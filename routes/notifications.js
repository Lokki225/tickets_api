const express = require('express');
const { query } = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Create notification
router.post('/',
  authenticateToken,
  validate(schemas.notificationCreate),
  async (req, res) => {
    try {
      const { utilisateurId, titre, message } = req.body;

      // Check if user has permission (admin or sending to themselves)
      const isSendingToSelf = utilisateurId === req.user.id;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isAdmin && !isSendingToSelf) {
        return res.status(403).json({ error: 'Not authorized to send notification to this user' });
      }

      const sql = `
        INSERT INTO notification (utilisateurId, titre, message, lu, createdAt)
        VALUES (?, ?, ?, 0, NOW(3))
      `;

      const result = await query(sql, [utilisateurId, titre, message]);

      // Get created notification
      const [notification] = await query(
        'SELECT * FROM notification WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        message: 'Notification created successfully',
        notification
      });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  }
);

// Get user's notifications
router.get('/',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const unreadOnly = req.query.unread === 'true';

      let whereClause = 'WHERE n.utilisateurId = ?';
      const params = [userId];

      if (unreadOnly) {
        whereClause += ' AND n.lu = 0';
      }

      const sql = `
        SELECT n.*
        FROM notification n
        ${whereClause}
        ORDER BY n.createdAt DESC
        LIMIT ? OFFSET ?
      `;

      const notifications = await query(sql, [...params, limit, offset]);

      // Get total count
      const countSql = `
        SELECT COUNT(*) as total
        FROM notification n
        ${whereClause}
      `;
      const [{ total }] = await query(countSql, params);

      // Get unread count
      const [unreadCount] = await query(
        'SELECT COUNT(*) as count FROM notification WHERE utilisateurId = ? AND lu = 0',
        [userId]
      );

      res.json({
        notifications,
        unreadCount: unreadCount.count,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }
);

// Mark notification as read
router.put('/:id/read',
  authenticateToken,
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if notification exists and belongs to user
      const [notification] = await query(
        'SELECT * FROM notification WHERE id = ? AND utilisateurId = ?',
        [id, req.user.id]
      );

      if (!notification.length) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      // Update notification
      await query(
        'UPDATE notification SET lu = 1 WHERE id = ?',
        [id]
      );

      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }
);

// Mark all notifications as read
router.put('/read-all',
  authenticateToken,
  async (req, res) => {
    try {
      await query(
        'UPDATE notification SET lu = 1 WHERE utilisateurId = ? AND lu = 0',
        [req.user.id]
      );

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }
);

// Delete notification
router.delete('/:id',
  authenticateToken,
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if notification exists and belongs to user
      const [notification] = await query(
        'SELECT * FROM notification WHERE id = ? AND utilisateurId = ?',
        [id, req.user.id]
      );

      if (!notification.length) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      // Delete notification
      await query('DELETE FROM notification WHERE id = ?', [id]);

      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }
);

// Get unread count
router.get('/unread/count',
  authenticateToken,
  async (req, res) => {
    try {
      const [result] = await query(
        'SELECT COUNT(*) as count FROM notification WHERE utilisateurId = ? AND lu = 0',
        [req.user.id]
      );

      res.json({ unreadCount: result.count });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  }
);

// Send bulk notifications (admin only)
router.post('/bulk',
  authenticateToken,
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const { userIds, titre, message } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'User IDs array is required' });
      }

      if (!titre || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
      }

      // Create notifications for all users
      const values = userIds.map(userId => [userId, titre, message]);
      const placeholders = values.map(() => '(?, ?, ?)').join(', ');
      const flatValues = values.flat();

      const sql = `
        INSERT INTO notification (utilisateurId, titre, message, lu, createdAt)
        VALUES ${placeholders}
      `;

      await query(sql, [...flatValues, ...Array(userIds.length).fill(0)]);

      res.json({
        message: `Bulk notifications sent to ${userIds.length} users`,
        count: userIds.length
      });
    } catch (error) {
      console.error('Send bulk notifications error:', error);
      res.status(500).json({ error: 'Failed to send bulk notifications' });
    }
  }
);

// Get notification by ID
router.get('/:id',
  authenticateToken,
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [notification] = await query(
        'SELECT * FROM notification WHERE id = ? AND utilisateurId = ?',
        [id, req.user.id]
      );

      if (!notification.length) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json(notification);
    } catch (error) {
      console.error('Get notification error:', error);
      res.status(500).json({ error: 'Failed to fetch notification' });
    }
  }
);

module.exports = router;
