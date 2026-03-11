const { query, transaction } = require('../config/database');

class Event {
  // Find event by ID with full details
  static async findById(id) {
    const sql = `
      SELECT e.*, 
             c.nom as categorieNom,
             l.nom as lieuNom, l.adresse, l.ville, l.pays,
             s.nom as statutNom,
             u.nom as organisateurNom, u.email as organisateurEmail
      FROM evenement e
      LEFT JOIN categorieevenement c ON e.categorieId = c.id
      LEFT JOIN lieuevenement l ON e.lieuId = l.id
      LEFT JOIN statutevenement s ON e.statutId = s.id
      LEFT JOIN utilisateur u ON e.organisateurId = u.id
      WHERE e.id = ?
    `;
    const events = await query(sql, [id]);
    return events[0] || null;
  }

  // Create new event
  static async create(eventData) {
    const { titre, description, dateDebut, dateFin, maxBillets, organisateurId, categorieId, lieuId, statutId } = eventData;
    
    const sql = `
      INSERT INTO evenement (titre, description, dateDebut, dateFin, maxBillets, organisateurId, categorieId, lieuId, statutId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    const result = await query(sql, [titre, description, dateDebut, dateFin, maxBillets, organisateurId, categorieId, lieuId, statutId]);
    return this.findById(result.insertId);
  }

  // Update event
  static async update(id, eventData) {
    const { titre, description, dateDebut, dateFin, maxBillets, categorieId, lieuId, statutId } = userData;
    const sql = `
      UPDATE evenement 
      SET titre = ?, description = ?, dateDebut = ?, dateFin = ?, maxBillets = ?, 
          categorieId = ?, lieuId = ?, statutId = ?, updatedAt = datetime('now')
      WHERE id = ?
    `;
    
    await query(sql, [titre, description, dateDebut, dateFin, maxBillets, categorieId, lieuId, statutId, id]);
    return this.findById(id);
  }

  // Get all events with pagination and filters
  static async getAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    // Apply filters
    if (filters.categorieId) {
      whereClause += ' AND e.categorieId = ?';
      params.push(filters.categorieId);
    }
    if (filters.statutId) {
      whereClause += ' AND e.statutId = ?';
      params.push(filters.statutId);
    }
    if (filters.organisateurId) {
      whereClause += ' AND e.organisateurId = ?';
      params.push(filters.organisateurId);
    }
    if (filters.search) {
      whereClause += ' AND (e.titre LIKE ? OR e.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.dateDebut) {
      whereClause += ' AND e.dateDebut >= ?';
      params.push(filters.dateDebut);
    }
    if (filters.dateFin) {
      whereClause += ' AND e.dateFin <= ?';
      params.push(filters.dateFin);
    }

    const sql = `
      SELECT e.*, 
             c.nom as categorieNom,
             l.nom as lieuNom, l.ville,
             s.nom as statutNom,
             u.nom as organisateurNom
      FROM evenement e
      LEFT JOIN categorieevenement c ON e.categorieId = c.id
      LEFT JOIN lieuevenement l ON e.lieuId = l.id
      LEFT JOIN statutevenement s ON e.statutId = s.id
      LEFT JOIN utilisateur u ON e.organisateurId = u.id
      ${whereClause}
      ORDER BY e.dateDebut ASC
      LIMIT ? OFFSET ?
    `;
    
    const events = await query(sql, [...params, limit, offset]);
    
    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM evenement e
      ${whereClause}
    `;
    const [{ total }] = await query(countSql, params);
    
    return {
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get events by organizer
  static async getByOrganizer(organizerId, page = 1, limit = 10) {
    return this.getAll(page, limit, { organisateurId: organizerId });
  }

  // Get upcoming events
  static async getUpcoming(page = 1, limit = 10) {
    const now = new Date().toISOString();
    return this.getAll(page, limit, { dateDebut: now });
  }

  // Delete event
  static async delete(id) {
    return await transaction(async (connection) => {
      // Delete related records first (due to foreign key constraints)
      await connection.execute('DELETE FROM programmeevenement WHERE evenementId = ?', [id]);
      await connection.execute('DELETE FROM statevenement WHERE evenementId = ?', [id]);
      await connection.execute('DELETE FROM evenement WHERE id = ?', [id]);
    });
  }

  // Get event statistics
  static async getStatistics(eventId) {
    const sql = `
      SELECT 
        COUNT(DISTINCT ab.id) as totalAchats,
        COUNT(DISTINCT ab.acheteurId) as totalAcheteurs,
        COUNT(ab.id) as totalBilletsVendus,
        COALESCE(SUM(p.montant), 0) as totalRevenus,
        e.maxBillets,
        (e.maxBillets - COALESCE(COUNT(ab.id), 0)) as billetsRestants
      FROM evenement e
      LEFT JOIN billet b ON e.id = b.evenementId
      LEFT JOIN achatbillet ab ON b.id = ab.billetId
      LEFT JOIN paiement p ON ab.id = p.achatBilletId AND p.statut = 'SUCCES'
      WHERE e.id = ?
      GROUP BY e.id
    `;
    
    const stats = await query(sql, [eventId]);
    return stats[0] || null;
  }

  // Get event tickets
  static async getTickets(eventId) {
    const sql = `
      SELECT b.*, tb.nom as typeNom, 
             (b.quantite - COALESCE(COUNT(ab.id), 0)) as disponible
      FROM billet b
      LEFT JOIN typebillet tb ON b.typeId = tb.id
      LEFT JOIN achatbillet ab ON b.id = ab.billetId
      WHERE b.evenementId = ?
      GROUP BY b.id
      ORDER BY b.prix ASC
    `;
    
    return await query(sql, [eventId]);
  }

  // Get event program/schedule
  static async getProgram(eventId) {
    const sql = `
      SELECT * FROM programmeevenement
      WHERE evenementId = ?
      ORDER BY heureDebut ASC
    `;
    
    return await query(sql, [eventId]);
  }
}

module.exports = Event;
