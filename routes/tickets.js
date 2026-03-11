const express = require('express');
const { query, transaction } = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get ticket types
router.get('/types', async (req, res) => {
  try {
    const sql = 'SELECT * FROM typebillet ORDER BY nom';
    const types = await query(sql);
    res.json(types);
  } catch (error) {
    console.error('Get ticket types error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket types' });
  }
});

// Get tickets for an event
router.get('/event/:eventId', validate(schemas.idParam, 'params'), async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const sql = `
      SELECT b.*, tb.nom as typeNom,
             (b.quantite - COALESCE(SUM(ab.quantite), 0)) as disponible,
             COUNT(ab.id) as totalAchats
      FROM billet b
      LEFT JOIN typebillet tb ON b.typeId = tb.id
      LEFT JOIN achatbillet ab ON b.id = ab.billetId
      WHERE b.evenementId = ?
      GROUP BY b.id
      ORDER BY b.prix ASC
    `;
    
    const tickets = await query(sql, [eventId]);
    res.json(tickets);
  } catch (error) {
    console.error('Get event tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch event tickets' });
  }
});

// Purchase tickets
router.post('/purchase',
  authenticateToken,
  validate(schemas.ticketPurchase),
  async (req, res) => {
    try {
      const { billetId, quantite } = req.body;
      const acheteurId = req.user.id;

      return await transaction(async (connection) => {
        // Check if ticket exists and get details
        const [ticketData] = await connection.execute(
          'SELECT b.*, e.maxBillets FROM billet b JOIN evenement e ON b.evenementId = e.id WHERE b.id = ?',
          [billetId]
        );

        if (!ticketData.length) {
          throw new Error('Ticket not found');
        }

        const ticket = ticketData[0];

        // Check availability
        const [soldData] = await connection.execute(
          'SELECT COALESCE(SUM(quantite), 0) as totalVendus FROM achatbillet WHERE billetId = ?',
          [billetId]
        );

        const totalVendus = soldData[0].totalVendus;
        const disponible = ticket.quantite - totalVendus;

        if (disponible < quantite) {
          throw new Error(`Only ${disponible} tickets available`);
        }

        // Generate unique code for each ticket
        const codes = [];
        for (let i = 0; i < quantite; i++) {
          codes.push(`TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
        }

        // Create ticket purchases
        const purchases = [];
        for (const code of codes) {
          const [result] = await connection.execute(
            'INSERT INTO achatbillet (billetId, acheteurId, codeUnique, utilise, createdAt, updatedAt) VALUES (?, ?, ?, 0, NOW(3), NOW(3))',
            [billetId, acheteurId, code]
          );
          
          purchases.push({
            id: result.insertId,
            billetId,
            acheteurId,
            codeUnique: code,
            utilise: 0
          });
        }

        // Update ticket sold count
        await connection.execute(
          'UPDATE billet SET vendus = vendus + ? WHERE id = ?',
          [quantite, billetId]
        );

        return purchases;
      });

    } catch (error) {
      console.error('Ticket purchase error:', error);
      if (error.message.includes('available') || error.message.includes('not found')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to purchase tickets' });
    }
  }
);

// Get user's tickets
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT ab.*, b.nom as billetNom, b.prix,
             e.titre as evenementTitre, e.dateDebut, e.dateFin,
             l.nom as lieuNom, l.ville,
             tb.nom as typeNom
      FROM achatbillet ab
      JOIN billet b ON ab.billetId = b.id
      JOIN evenement e ON b.evenementId = e.id
      JOIN lieuevenement l ON e.lieuId = l.id
      JOIN typebillet tb ON b.typeId = tb.id
      WHERE ab.acheteurId = ?
      ORDER BY ab.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const tickets = await query(sql, [userId, limit, offset]);

    // Get total count
    const countSql = 'SELECT COUNT(*) as total FROM achatbillet WHERE acheteurId = ?';
    const [{ total }] = await query(countSql, [userId]);

    res.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch your tickets' });
  }
});

// Get ticket details by code
router.get('/code/:code', validate(schemas.idParam, 'params'), async (req, res) => {
  try {
    const { code } = req.params;

    const sql = `
      SELECT ab.*, b.nom as billetNom, b.prix,
             e.titre as evenementTitre, e.dateDebut, e.dateFin,
             l.nom as lieuNom, l.ville,
             u.nom as acheteurNom, u.email as acheteurEmail
      FROM achatbillet ab
      JOIN billet b ON ab.billetId = b.id
      JOIN evenement e ON b.evenementId = e.id
      JOIN lieuevenement l ON e.lieuId = l.id
      JOIN utilisateur u ON ab.acheteurId = u.id
      WHERE ab.codeUnique = ?
    `;

    const tickets = await query(sql, [code]);
    
    if (!tickets.length) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(tickets[0]);
  } catch (error) {
    console.error('Get ticket by code error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Scan ticket (validate)
router.post('/scan',
  authenticateToken,
  requireRole(['ADMIN', 'ORGANIZER', 'SCANNER']),
  async (req, res) => {
    try {
      const { code, statutId } = req.body; // statutId: 1=VALID, 2=INVALID, 3=ALREADY_USED
      const scanneurId = req.user.id;

      if (!code || !statutId) {
        return res.status(400).json({ error: 'Code and status are required' });
      }

      return await transaction(async (connection) => {
        // Get ticket details
        const [ticketData] = await connection.execute(
          'SELECT * FROM achatbillet WHERE codeUnique = ?',
          [code]
        );

        if (!ticketData.length) {
          throw new Error('Ticket not found');
        }

        const ticket = ticketData[0];

        // Check if already used
        if (ticket.utilise) {
          // Check if already scanned
          const [existingScan] = await connection.execute(
            'SELECT * FROM scanbillet WHERE achatBilletId = ?',
            [ticket.id]
          );

          if (existingScan.length) {
            return {
              message: 'Ticket already scanned',
              ticket: existingScan[0],
              alreadyScanned: true
            };
          }
        }

        // Create scan record
        const [scanResult] = await connection.execute(
          'INSERT INTO scanbillet (achatBilletId, proprietaireId, scanneurId, statutId, scanneLe) VALUES (?, ?, ?, ?, NOW(3))',
          [ticket.id, ticket.acheteurId, scanneurId, statutId]
        );

        // Mark ticket as used if valid
        if (statutId == 1) { // VALID status
          await connection.execute(
            'UPDATE achatbillet SET utilise = 1, updatedAt = NOW(3) WHERE id = ?',
            [ticket.id]
          );
        }

        // Get scan details
        const [scanDetails] = await connection.execute(
          'SELECT sb.*, ss.nom as statutNom, s.nom as scanneurNom FROM scanbillet sb JOIN statutscan ss ON sb.statutId = ss.id JOIN utilisateur s ON sb.scanneurId = s.id WHERE sb.id = ?',
          [scanResult.insertId]
        );

        return {
          message: 'Ticket scanned successfully',
          scan: scanDetails[0],
          alreadyScanned: false
        };
      });

    } catch (error) {
      console.error('Scan ticket error:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to scan ticket' });
    }
  }
);

// Get scan history for an event
router.get('/scan/history/:eventId',
  authenticateToken,
  requireRole(['ADMIN', 'ORGANIZER']),
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      const sql = `
        SELECT sb.*, ab.codeUnique,
               u1.nom as proprietaireNom, u1.email as proprietaireEmail,
               u2.nom as scanneurNom,
               ss.nom as statutNom,
               b.nom as billetNom,
               e.titre as evenementTitre
        FROM scanbillet sb
        JOIN achatbillet ab ON sb.achatBilletId = ab.id
        JOIN billet b ON ab.billetId = b.id
        JOIN evenement e ON b.evenementId = e.id
        JOIN utilisateur u1 ON sb.proprietaireId = u1.id
        JOIN utilisateur u2 ON sb.scanneurId = u2.id
        JOIN statutscan ss ON sb.statutId = ss.id
        WHERE e.id = ?
        ORDER BY sb.scanneLe DESC
        LIMIT ? OFFSET ?
      `;

      const scans = await query(sql, [eventId, limit, offset]);

      // Get total count
      const countSql = `
        SELECT COUNT(*) as total
        FROM scanbillet sb
        JOIN achatbillet ab ON sb.achatBilletId = ab.id
        JOIN billet b ON ab.billetId = b.id
        WHERE b.evenementId = ?
      `;
      const [{ total }] = await query(countSql, [eventId]);

      res.json({
        scans,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get scan history error:', error);
      res.status(500).json({ error: 'Failed to fetch scan history' });
    }
  }
);

module.exports = router;
