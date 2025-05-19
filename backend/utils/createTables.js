/**
 * Direct table creation utility
 * This bypasses Sequelize's sync mechanism to create tables directly
 */
const { Sequelize } = require('sequelize');

/**
 * Create tables directly using SQL commands
 * @param {Sequelize} sequelize - Sequelize instance
 */
const createTablesDirectly = async (sequelize) => {
  console.log('Starting direct table creation...');

  try {
    // Create Users table - using lowercase names
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        isAdmin BOOLEAN DEFAULT false,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      );
    `);
    console.log('Users table created');

    // Create Rooms table - using lowercase names
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        mainImage VARCHAR(255),
        images TEXT,
        type VARCHAR(50) NOT NULL,
        adultCapacity INTEGER NOT NULL DEFAULT 2,
        childrenCapacity INTEGER NOT NULL DEFAULT 0,
        features TEXT,
        rating DECIMAL(3, 2) DEFAULT 0,
        numReviews INTEGER DEFAULT 0,
        availability BOOLEAN DEFAULT true,
        size VARCHAR(50),
        beds VARCHAR(100),
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      );
    `);
    console.log('Rooms table created');

    // Create Bookings table - using lowercase names
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        checkInDate DATE NOT NULL,
        checkOutDate DATE NOT NULL,
        numberOfAdults INTEGER NOT NULL DEFAULT 1,
        numberOfChildren INTEGER NOT NULL DEFAULT 0,
        numberOfRooms INTEGER NOT NULL DEFAULT 1,
        totalPrice DECIMAL(10, 2) NOT NULL,
        specialRequests TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        paymentStatus VARCHAR(20) DEFAULT 'pending',
        paymentMethod VARCHAR(50),
        UserId INTEGER,
        RoomId INTEGER,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        FOREIGN KEY (UserId) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (RoomId) REFERENCES rooms(id) ON DELETE SET NULL
      );
    `);
    console.log('Bookings table created');

    // Create Room Inventory table - using lowercase to match MySQL default behavior
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS roominventories (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        roomType VARCHAR(50) NOT NULL,
        totalRooms INTEGER NOT NULL,
        availableRooms INTEGER NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      );
    `);
    console.log('RoomInventories table created');

    // Create Room Availability table - using lowercase names
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS roomavailabilities (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        roomType VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        bookedRooms INTEGER NOT NULL DEFAULT 0,
        availableRooms INTEGER NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      );
    `);
    console.log('RoomAvailabilities table created');

    console.log('All tables created successfully');
    return true;
  } catch (error) {
    console.error('Error creating tables directly:', error);
    return false;
  }
};

module.exports = { createTablesDirectly };
