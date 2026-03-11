const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Find user by ID
  static async findById(id) {
    const sql = `
      SELECT u.*, r.nom as roleNom
      FROM utilisateur u
      LEFT JOIN role r ON u.roleId = r.id
      WHERE u.id = ?
    `;
    const users = await query(sql, [id]);
    return users[0] || null;
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = `
      SELECT u.*, r.nom as roleNom
      FROM utilisateur u
      LEFT JOIN role r ON u.roleId = r.id
      WHERE u.email = ?
    `;
    const users = await query(sql, [email]);
    return users[0] || null;
  }

  // Create new user
  static async create(userData) {
    const { nom, email, motDePasse, roleId } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    
    const sql = `
      INSERT INTO utilisateur (nom, email, motDePasse, roleId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    const result = await query(sql, [nom, email, hashedPassword, roleId]);
    return this.findById(result.insertId);
  }

  // Update user
  static async update(id, userData) {
    const { nom, email, roleId } = userData;
    const sql = `
      UPDATE utilisateur 
      SET nom = ?, email = ?, roleId = ?, updatedAt = datetime('now')
      WHERE id = ?
    `;
    
    await query(sql, [nom, email, roleId, id]);
    return this.findById(id);
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql = `
      UPDATE utilisateur 
      SET motDePasse = ?, updatedAt = NOW(3)
      WHERE id = ?
    `;
    
    await query(sql, [hashedPassword, id]);
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get user profile
  static async getProfile(userId) {
    const sql = `
      SELECT u.*, p.telephone, p.adresse, p.avatarUrl, p.bio, r.nom as roleNom
      FROM utilisateur u
      LEFT JOIN profilutilisateur p ON u.id = p.utilisateurId
      LEFT JOIN role r ON u.roleId = r.id
      WHERE u.id = ?
    `;
    const users = await query(sql, [userId]);
    return users[0] || null;
  }

  // Update user profile
  static async updateProfile(userId, profileData) {
    const { telephone, adresse, avatarUrl, bio } = profileData;
    
    // Check if profile exists
    const existingProfile = await query(
      'SELECT * FROM profilutilisateur WHERE utilisateurId = ?',
      [userId]
    );
    
    if (existingProfile.length > 0) {
      // Update existing profile
      const sql = `
        UPDATE profilutilisateur 
        SET telephone = ?, adresse = ?, avatarUrl = ?, bio = ?, updatedAt = NOW(3)
        WHERE utilisateurId = ?
      `;
      await query(sql, [telephone, adresse, avatarUrl, bio, userId]);
    } else {
      // Create new profile
      const sql = `
        INSERT INTO profilutilisateur (utilisateurId, telephone, adresse, avatarUrl, bio, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, NOW(3), NOW(3))
      `;
      await query(sql, [userId, telephone, adresse, avatarUrl, bio]);
    }
    
    return this.getProfile(userId);
  }

  // Get all users (admin only)
  static async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT u.id, u.nom, u.email, u.createdAt, u.updatedAt, r.nom as roleNom
      FROM utilisateur u
      LEFT JOIN role r ON u.roleId = r.id
      ORDER BY u.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const users = await query(sql, [limit, offset]);
    
    // Get total count
    const countSql = 'SELECT COUNT(*) as total FROM utilisateur';
    const [{ total }] = await query(countSql);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Delete user (admin only)
  static async delete(id) {
    const sql = 'DELETE FROM utilisateur WHERE id = ?';
    await query(sql, [id]);
  }
}

module.exports = User;
