const express = require('express');
const Event = require('../models/Event');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Get all events (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {};

    // Apply filters from query params
    if (req.query.categorieId) filters.categorieId = parseInt(req.query.categorieId);
    if (req.query.statutId) filters.statutId = parseInt(req.query.statutId);
    if (req.query.organisateurId) filters.organisateurId = parseInt(req.query.organisateurId);
    if (req.query.search) filters.search = req.query.search;
    if (req.query.dateDebut) filters.dateDebut = req.query.dateDebut;
    if (req.query.dateFin) filters.dateFin = req.query.dateFin;

    const result = await Event.getAll(page, limit, filters);
    res.json(result);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event by ID (public)
router.get('/:id', validate(schemas.idParam, 'params'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get event statistics
    const statistics = await Event.getStatistics(req.params.id);
    
    // Get event tickets
    const tickets = await Event.getTickets(req.params.id);

    // Get event program
    const program = await Event.getProgram(req.params.id);

    res.json({
      event,
      statistics,
      tickets,
      program
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event (authenticated users with appropriate role)
router.post('/', 
  authenticateToken,
  requireRole(['ADMIN', 'ORGANIZER']),
  validate(schemas.eventCreate),
  async (req, res) => {
    try {
      const eventData = {
        ...req.body,
        organisateurId: req.user.id // Override with current user ID
      };

      const event = await Event.create(eventData);
      res.status(201).json({
        message: 'Event created successfully',
        event
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
);

// Update event (organizer or admin)
router.put('/:id',
  authenticateToken,
  requireRole(['ADMIN', 'ORGANIZER']),
  validate(schemas.idParam, 'params'),
  validate(schemas.eventUpdate),
  async (req, res) => {
    try {
      // Check if event exists and user has permission
      const existingEvent = await Event.findById(req.params.id);
      if (!existingEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check if user is the organizer or admin
      if (req.user.role !== 'ADMIN' && existingEvent.organisateurId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to update this event' });
      }

      const event = await Event.update(req.params.id, req.body);
      res.json({
        message: 'Event updated successfully',
        event
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  }
);

// Delete event (organizer or admin)
router.delete('/:id',
  authenticateToken,
  requireRole(['ADMIN', 'ORGANIZER']),
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      // Check if event exists and user has permission
      const existingEvent = await Event.findById(req.params.id);
      if (!existingEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check if user is the organizer or admin
      if (req.user.role !== 'ADMIN' && existingEvent.organisateurId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to delete this event' });
      }

      await Event.delete(req.params.id);
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  }
);

// Get events by current user (organizer)
router.get('/my/events',
  authenticateToken,
  requireRole(['ADMIN', 'ORGANIZER']),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await Event.getByOrganizer(req.user.id, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Get my events error:', error);
      res.status(500).json({ error: 'Failed to fetch your events' });
    }
  }
);

// Get upcoming events (public)
router.get('/upcoming/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await Event.getUpcoming(page, limit);
    res.json(result);
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// Get event statistics (organizer or admin)
router.get('/:id/statistics',
  authenticateToken,
  requireRole(['ADMIN', 'ORGANIZER']),
  validate(schemas.idParam, 'params'),
  async (req, res) => {
    try {
      // Check if event exists and user has permission
      const existingEvent = await Event.findById(req.params.id);
      if (!existingEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check if user is the organizer or admin
      if (req.user.role !== 'ADMIN' && existingEvent.organisateurId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to view these statistics' });
      }

      const statistics = await Event.getStatistics(req.params.id);
      res.json(statistics);
    } catch (error) {
      console.error('Get event statistics error:', error);
      res.status(500).json({ error: 'Failed to fetch event statistics' });
    }
  }
);

module.exports = router;
