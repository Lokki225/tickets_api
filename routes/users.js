const express = require('express');
const User = require('../models/User');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get all users (admin only)
router.get('/',
  authenticateToken,
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await User.getAll(page, limit);
      res.json(result);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

// Get user by ID (admin or own profile)
router.get('/:id',
  authenticateToken,
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      // Check if user is admin or requesting own profile
      const isOwnProfile = userId === req.user.id;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isOwnProfile && !isAdmin) {
        return res.status(403).json({ error: 'Not authorized to view this profile' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove sensitive data
      delete user.motDePasse;

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
);

// Update user (admin or own profile)
router.put('/:id',
  authenticateToken,
  validate(schemas.idParam, 'params'),
  validate(schemas.userUpdate),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      // Check if user is admin or updating own profile
      const isOwnProfile = userId === req.user.id;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isOwnProfile && !isAdmin) {
        return res.status(403).json({ error: 'Not authorized to update this user' });
      }

      // Non-admin users cannot change their role
      if (!isAdmin && req.body.roleId) {
        delete req.body.roleId;
      }

      const updatedUser = await User.update(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove sensitive data
      delete updatedUser.motDePasse;

      res.json({
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

// Delete user (admin only)
router.delete('/:id',
  authenticateToken,
  requireRole(['ADMIN']),
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      // Prevent admin from deleting themselves
      if (userId === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await User.delete(userId);

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);

// Get user roles (public)
router.get('/roles/list', async (req, res) => {
  try {
    const sql = 'SELECT * FROM role ORDER BY nom';
    const { query } = require('../config/database');
    const roles = await query(sql);
    res.json(roles);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get user statistics (admin only)
router.get('/statistics/overview',
  authenticateToken,
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const { query } = require('../config/database');
      
      // Get total users
      const [totalUsers] = await query('SELECT COUNT(*) as count FROM utilisateur');
      
      // Get users by role
      const usersByRole = await query(`
        SELECT r.nom as role, COUNT(u.id) as count
        FROM role r
        LEFT JOIN utilisateur u ON r.id = u.roleId
        GROUP BY r.id, r.nom
        ORDER BY count DESC
      `);
      
      // Get recent registrations (last 30 days)
      const [recentUsers] = await query(`
        SELECT COUNT(*) as count 
        FROM utilisateur 
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);
      
      // Get active users (users with ticket purchases in last 30 days)
      const [activeUsers] = await query(`
        SELECT COUNT(DISTINCT ab.acheteurId) as count
        FROM achatbillet ab
        WHERE ab.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);

      res.json({
        totalUsers: totalUsers.count,
        usersByRole,
        recentUsers: recentUsers.count,
        activeUsers: activeUsers.count
      });
    } catch (error) {
      console.error('Get user statistics error:', error);
      res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
  }
);

// Search users (admin only)
router.get('/search/query',
  authenticateToken,
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const { q: searchQuery, role, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      if (!searchQuery) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      let whereClause = 'WHERE (u.nom LIKE ? OR u.email LIKE ?)';
      let params = [`%${searchQuery}%`, `%${searchQuery}%`];

      if (role) {
        whereClause += ' AND r.nom = ?';
        params.push(role);
      }

      const sql = `
        SELECT u.id, u.nom, u.email, u.createdAt, u.updatedAt, r.nom as roleNom
        FROM utilisateur u
        LEFT JOIN role r ON u.roleId = r.id
        ${whereClause}
        ORDER BY u.nom ASC
        LIMIT ? OFFSET ?
      `;

      const { query } = require('../config/database');
      const users = await query(sql, [...params, parseInt(limit), offset]);

      // Get total count
      const countSql = `
        SELECT COUNT(*) as total
        FROM utilisateur u
        LEFT JOIN role r ON u.roleId = r.id
        ${whereClause}
      `;
      const [{ total }] = await query(countSql, params);

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  }
);

// Get user's events (authenticated)
router.get('/:id/events',
  authenticateToken,
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      // Check if user is admin or requesting own events
      const isOwnProfile = userId === req.user.id;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isOwnProfile && !isAdmin) {
        return res.status(403).json({ error: 'Not authorized to view these events' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { query } = require('../config/database');
      
      // Get events organized by user
      const sql = `
        SELECT e.*, c.nom as categorieNom, l.nom as lieuNom, l.ville,
               s.nom as statutNom
        FROM evenement e
        LEFT JOIN categorieevenement c ON e.categorieId = c.id
        LEFT JOIN lieuevenement l ON e.lieuId = l.id
        LEFT JOIN statutevenement s ON e.statutId = s.id
        WHERE e.organisateurId = ?
        ORDER BY e.dateDebut DESC
        LIMIT ? OFFSET ?
      `;

      const events = await query(sql, [userId, limit, offset]);

      // Get total count
      const countSql = 'SELECT COUNT(*) as total FROM evenement WHERE organisateurId = ?';
      const [{ total }] = await query(countSql, [userId]);

      res.json({
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get user events error:', error);
      res.status(500).json({ error: 'Failed to fetch user events' });
    }
  }
);

module.exports = router;
