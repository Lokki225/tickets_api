const express = require('express');
const { query, transaction } = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get payment providers
router.get('/providers', async (req, res) => {
  try {
    const sql = 'SELECT * FROM prestatairepaiement ORDER BY nom';
    const providers = await query(sql);
    res.json(providers);
  } catch (error) {
    console.error('Get payment providers error:', error);
    res.status(500).json({ error: 'Failed to fetch payment providers' });
  }
});

// Create payment
router.post('/',
  authenticateToken,
  validate(schemas.paymentCreate),
  async (req, res) => {
    try {
      const { achatBilletId, prestataireId, evenementId, montant, reference } = req.body;

      return await transaction(async (connection) => {
        // Check if payment already exists for this purchase
        const [existingPayment] = await connection.execute(
          'SELECT * FROM paiement WHERE achatBilletId = ?',
          [achatBilletId]
        );

        if (existingPayment.length) {
          throw new Error('Payment already processed for this ticket purchase');
        }

        // Create payment record
        const [result] = await connection.execute(
          'INSERT INTO paiement (achatBilletId, prestataireId, evenementId, montant, reference, statut, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, "EN_ATTENTE", NOW(3), NOW(3))',
          [achatBilletId, prestataireId, evenementId, montant, reference]
        );

        // Get payment details
        const [paymentDetails] = await connection.execute(
          `SELECT p.*, pp.nom as prestataireNom, e.titre as evenementTitre,
                  ab.codeUnique, u.nom as acheteurNom, u.email as acheteurEmail
           FROM paiement p
           JOIN prestatairepaiement pp ON p.prestataireId = pp.id
           JOIN evenement e ON p.evenementId = e.id
           JOIN achatbillet ab ON p.achatBilletId = ab.id
           JOIN utilisateur u ON ab.acheteurId = u.id
           WHERE p.id = ?`,
          [result.insertId]
        );

        return {
          message: 'Payment initiated successfully',
          payment: paymentDetails[0]
        };
      });

    } catch (error) {
      console.error('Create payment error:', error);
      if (error.message.includes('already processed')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create payment' });
    }
  }
);

// Update payment status (webhook endpoint)
router.post('/webhook/:provider',
  async (req, res) => {
    try {
      const { provider } = req.params;
      const { reference, status, amount } = req.body;

      if (!reference || !status) {
        return res.status(400).json({ error: 'Reference and status are required' });
      }

      // Validate status
      const validStatuses = ['EN_ATTENTE', 'SUCCES', 'ECHEC'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid payment status' });
      }

      return await transaction(async (connection) => {
        // Find payment by reference
        const [paymentData] = await connection.execute(
          'SELECT * FROM paiement WHERE reference = ?',
          [reference]
        );

        if (!paymentData.length) {
          throw new Error('Payment not found');
        }

        const payment = paymentData[0];

        // Update payment status
        await connection.execute(
          'UPDATE paiement SET statut = ?, updatedAt = NOW(3) WHERE id = ?',
          [status, payment.id]
        );

        // If payment successful, update event statistics
        if (status === 'SUCCES') {
          // Check if statistics already exist for this event
          const [existingStats] = await connection.execute(
            'SELECT * FROM statevenement WHERE evenementId = ?',
            [payment.evenementId]
          );

          if (existingStats.length) {
            // Update existing statistics
            await connection.execute(
              'UPDATE statevenement SET revenu = revenu + ?, billetsVendus = billetsVendus + 1 WHERE evenementId = ?',
              [payment.montant, payment.evenementId]
            );
          } else {
            // Create new statistics record
            await connection.execute(
              'INSERT INTO statevenement (evenementId, billetsVendus, revenu, createdAt) VALUES (?, 1, ?, NOW(3))',
              [payment.evenementId, payment.montant]
            );
          }
        }

        return {
          message: 'Payment status updated successfully',
          paymentId: payment.id,
          reference,
          status
        };
      });

    } catch (error) {
      console.error('Payment webhook error:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update payment status' });
    }
  }
);

// Get payment by ID
router.get('/:id',
  authenticateToken,
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const sql = `
        SELECT p.*, pp.nom as prestataireNom, e.titre as evenementTitre,
               ab.codeUnique, u.nom as acheteurNom, u.email as acheteurEmail
        FROM paiement p
        JOIN prestatairepaiement pp ON p.prestataireId = pp.id
        JOIN evenement e ON p.evenementId = e.id
        JOIN achatbillet ab ON p.achatBilletId = ab.id
        JOIN utilisateur u ON ab.acheteurId = u.id
        WHERE p.id = ?
      `;

      const payments = await query(sql, [id]);

      if (!payments.length) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      // Check if user has permission (admin, organizer of the event, or the buyer)
      const payment = payments[0];
      const [eventData] = await query(
        'SELECT organisateurId FROM evenement WHERE id = ?',
        [payment.evenementId]
      );

      const isOrganizer = eventData.length && eventData[0].organisateurId === req.user.id;
      const isBuyer = payment.acheteurId === req.user.id;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isAdmin && !isOrganizer && !isBuyer) {
        return res.status(403).json({ error: 'Not authorized to view this payment' });
      }

      res.json(payment);
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({ error: 'Failed to fetch payment' });
    }
  }
);

// Get user's payments
router.get('/my/payments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT p.*, pp.nom as prestataireNom, e.titre as evenementTitre,
             ab.codeUnique, ab.utilise
      FROM paiement p
      JOIN prestatairepaiement pp ON p.prestataireId = pp.id
      JOIN evenement e ON p.evenementId = e.id
      JOIN achatbillet ab ON p.achatBilletId = ab.id
      WHERE ab.acheteurId = ?
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const payments = await query(sql, [userId, limit, offset]);

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM paiement p
      JOIN achatbillet ab ON p.achatBilletId = ab.id
      WHERE ab.acheteurId = ?
    `;
    const [{ total }] = await query(countSql, [userId]);

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ error: 'Failed to fetch your payments' });
  }
});

// Get event payments (organizer/admin)
router.get('/event/:eventId',
  authenticateToken,
  requireRole(['ADMIN', 'ORGANIZER']),
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      // Check if user is organizer or admin
      if (req.user.role !== 'ADMIN') {
        const [eventData] = await query(
          'SELECT organisateurId FROM evenement WHERE id = ?',
          [eventId]
        );

        if (!eventData.length || eventData[0].organisateurId !== req.user.id) {
          return res.status(403).json({ error: 'Not authorized to view these payments' });
        }
      }

      const sql = `
        SELECT p.*, pp.nom as prestataireNom,
               ab.codeUnique, u.nom as acheteurNom, u.email as acheteurEmail
        FROM paiement p
        JOIN prestatairepaiement pp ON p.prestataireId = pp.id
        JOIN achatbillet ab ON p.achatBilletId = ab.id
        JOIN utilisateur u ON ab.acheteurId = u.id
        WHERE p.evenementId = ?
        ORDER BY p.createdAt DESC
        LIMIT ? OFFSET ?
      `;

      const payments = await query(sql, [eventId, limit, offset]);

      // Get total count
      const countSql = 'SELECT COUNT(*) as total FROM paiement WHERE evenementId = ?';
      const [{ total }] = await query(countSql, [eventId]);

      res.json({
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get event payments error:', error);
      res.status(500).json({ error: 'Failed to fetch event payments' });
    }
  }
);

// Request refund
router.post('/:id/refund',
  authenticateToken,
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { raison } = req.body;

      if (!raison) {
        return res.status(400).json({ error: 'Refund reason is required' });
      }

      return await transaction(async (connection) => {
        // Get payment details
        const [paymentData] = await connection.execute(
          'SELECT * FROM paiement WHERE id = ?',
          [id]
        );

        if (!paymentData.length) {
          throw new Error('Payment not found');
        }

        const payment = paymentData[0];

        // Check if payment is successful
        if (payment.statut !== 'SUCCES') {
          throw new Error('Only successful payments can be refunded');
        }

        // Check if refund already exists
        const [existingRefund] = await connection.execute(
          'SELECT * FROM remboursement WHERE paiementId = ?',
          [id]
        );

        if (existingRefund.length) {
          throw new Error('Refund already processed for this payment');
        }

        // Check user permission
        const [ticketData] = await connection.execute(
          'SELECT ab.acheteurId, e.organisateurId FROM achatbillet ab JOIN billet b ON ab.billetId = b.id JOIN evenement e ON b.evenementId = e.id WHERE ab.id = ?',
          [payment.achatBilletId]
        );

        const isBuyer = ticketData.length && ticketData[0].acheteurId === req.user.id;
        const isOrganizer = ticketData.length && ticketData[0].organisateurId === req.user.id;
        const isAdmin = req.user.role === 'ADMIN';

        if (!isAdmin && !isOrganizer && !isBuyer) {
          throw new Error('Not authorized to request refund for this payment');
        }

        // Create refund record
        const [result] = await connection.execute(
          'INSERT INTO remboursement (paiementId, raison, montant, createdAt) VALUES (?, ?, ?, NOW(3))',
          [id, raison, payment.montant]
        );

        // Update payment status
        await connection.execute(
          'UPDATE paiement SET statut = "ECHEC", updatedAt = NOW(3) WHERE id = ?',
          [id]
        );

        return {
          message: 'Refund requested successfully',
          refundId: result.insertId,
          paymentId: id,
          montant: payment.montant
        };
      });

    } catch (error) {
      console.error('Request refund error:', error);
      if (error.message.includes('not found') || error.message.includes('already processed') || error.message.includes('authorized')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to request refund' });
    }
  }
);

module.exports = router;
