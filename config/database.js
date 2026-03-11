const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config();

// SQLite database configuration
const dbPath = path.join(__dirname, '..', 'gestion_evenements.db');

// Create database connection
const createConnection = async () => {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    
    console.log('✅ SQLite database connected successfully');
    return db;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

// Initialize database connection
let db = null;
const initializeDb = async () => {
  if (!db) {
    db = await createConnection();
  }
  return db;
};

// Test database connection
const testConnection = async () => {
  try {
    const connection = await initializeDb();
    await connection.get('SELECT 1');
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
};

// Execute query with error handling
const query = async (sql, params = []) => {
  try {
    const connection = await initializeDb();
    
    if (sql.trim().toUpperCase().startsWith('SELECT') || 
        sql.trim().toUpperCase().startsWith('WITH')) {
      // For SELECT queries, use all() to get all rows
      const rows = await connection.all(sql, params);
      return rows;
    } else {
      // For INSERT, UPDATE, DELETE queries, use run() and return info
      const result = await connection.run(sql, params);
      
      // For INSERT queries, return the inserted data
      if (sql.trim().toUpperCase().startsWith('INSERT')) {
        const insertedId = result.lastID;
        if (insertedId) {
          // Try to get the inserted row
          const tableName = sql.match(/INSERT INTO `?(\w+)`?/i)?.[1];
          if (tableName) {
            const insertedRow = await connection.get(
              `SELECT * FROM ${tableName} WHERE rowid = ?`,
              [insertedId]
            );
            return [insertedRow];
          }
        }
        return [{ insertId: insertedId, changes: result.changes }];
      }
      
      // For other queries, return affected row info
      return [{ changes: result.changes, lastID: result.lastID }];
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Execute transaction
const transaction = async (callback) => {
  const connection = await initializeDb();
  
  try {
    await connection.exec('BEGIN TRANSACTION');
    const result = await callback(connection);
    await connection.exec('COMMIT');
    return result;
  } catch (error) {
    await connection.exec('ROLLBACK');
    throw error;
  }
};

// Get single row (for convenience)
const get = async (sql, params = []) => {
  try {
    const connection = await initializeDb();
    const row = await connection.get(sql, params);
    return row;
  } catch (error) {
    console.error('Database get error:', error);
    throw error;
  }
};

// Close database connection
const close = async () => {
  if (db) {
    await db.close();
    db = null;
    console.log('📴 Database connection closed');
  }
};

module.exports = {
  initializeDb,
  query,
  transaction,
  get,
  testConnection,
  close,
  dbPath
};
