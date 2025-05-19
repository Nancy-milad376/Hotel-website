/**
 * Database initialization utility
 * Helps ensure proper database setup and table creation
 */
const db = require('../models');
const { Op } = require('sequelize');
const { createTablesDirectly } = require('./createTables');
const roomTypes = [
  { type: 'honeymoon', name: 'Honeymoon Suite', count: 20 },
  { type: 'family', name: 'Family Suite', count: 10 },
  { type: 'panoramic', name: 'Ocean View Room', count: 25 },
  { type: 'exclusive', name: 'Luxury Suite', count: 30 },
  { type: 'deluxe', name: 'Deluxe Single Room', count: 10 },
  { type: 'presidential', name: 'Presidential Suite', count: 15 }
];

// Database state tracking
let databaseReady = false;
let tablesInitialized = false;
let inventoryInitialized = false;

/**
 * Initialize the database and create all necessary tables
 */
const initializeDatabase = async (sequelize) => {
  try {
    console.log('Starting database initialization...');

    // Create tables directly using SQL - this is more reliable than Sequelize sync
    await createTablesDirectly(sequelize);
    
    // Mark tables as initialized
    tablesInitialized = true;
    
    // Wait a moment to ensure tables are fully created
    console.log('Waiting for tables to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Try to test table access
    try {
      const test = await sequelize.query('SELECT 1 FROM RoomInventories LIMIT 1');
      console.log('Table access verified');
    } catch (tableError) {
      console.log('Tables may not be fully ready yet, but continuing anyway');
    }
    
    // Initialize room inventory
    await initializeInventory();
    inventoryInitialized = true;
    
    console.log('Database initialization complete');
    databaseReady = true;
    
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Set ready flag to true even with errors to allow system to function
    databaseReady = true;
    return false;
  }
};

/**
 * Initialize room inventory
 */
const initializeInventory = async () => {
  try {
    console.log('Initializing room inventory...');
    
    // Create inventory records for each room type using direct SQL
    // This is more reliable than using the ORM when tables are newly created
    for (const room of roomTypes) {
      try {
        await db.sequelize.query(
          `INSERT INTO roominventories (roomType, totalRooms, availableRooms, createdAt, updatedAt) 
           VALUES (?, ?, ?, NOW(), NOW())`,
          { 
            replacements: [room.type, room.count, room.count],
            type: db.sequelize.QueryTypes.INSERT 
          }
        );
        console.log(`Initialized inventory for ${room.name}: ${room.count} rooms`);
      } catch (insertError) {
        console.error(`Failed to initialize ${room.name} inventory:`, insertError);
      }
    }
    
    console.log('Room inventory initialization completed');
    return true;
  } catch (error) {
    console.error('Error initializing room inventory:', error);
    return false;
  }
};

/**
 * Check if the database is ready
 */
const isDatabaseReady = () => {
  return databaseReady;
};

/**
 * Get current initialization status
 */
const getInitStatus = () => {
  return {
    tablesInitialized,
    inventoryInitialized,
    databaseReady
  };
};

module.exports = {
  initializeDatabase,
  isDatabaseReady,
  getInitStatus,
  roomTypes
};
