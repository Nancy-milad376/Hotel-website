// backend/utils/databaseInit.js

const db = require("../models");
const { createTablesDirectly } = require("./createTables");
const { rooms: roomsData } = require("./seeder"); // make sure seeder.js exports { rooms, importData, deleteData }

let databaseReady = false;
let tablesInitialized = false;
let inventoryInitialized = false;

/**
 * Seed rooms table if empty
 */
async function seedRooms() {
  const count = await db.room.count();
  if (count > 0) {
    console.log("🛏️ Rooms already seeded — skipping.");
    return;
  }
  await db.room.bulkCreate(roomsData);
  console.log("🛏️ Rooms table seeded from seeder.js");
}

/**
 * Initialize room inventory (clear old rows, then insert fresh)
 */
async function initializeInventory() {
  console.log("🧮 Truncating old roominventories...");
  await db.roominventory.destroy({ where: {} });

  console.log("🧮 Seeding room inventory...");
  // You can import your roomTypes list or hard-code here:
  const roomTypes = [
    { type: "honeymoon", name: "Honeymoon Suite", count: 20 },
    { type: "family", name: "Family Suite", count: 10 },
    { type: "panoramic", name: "Ocean View Room", count: 25 },
    { type: "exclusive", name: "Luxury Suite", count: 30 },
    { type: "deluxe", name: "Deluxe Single Room", count: 10 },
    { type: "presidential", name: "Presidential Suite", count: 15 },
  ];

  for (const { type, name, count } of roomTypes) {
    await db.roominventory.create({
      roomType: type,
      totalRooms: count,
      availableRooms: count,
    });
    console.log(`  • ${name} (${type}): ${count} rooms`);
  }

  inventoryInitialized = true;
  console.log("✅ Room inventory initialized");
}

/**
 * Initialize the database: tables → seed rooms → seed inventory
 */
async function initializeDatabase() {
  try {
    console.log("🚀 Starting database initialization...");

    // 1) Create tables via raw SQL
    await createTablesDirectly(db.sequelize);
    tablesInitialized = true;
    console.log("✅ Tables created");

    // 2) Seed rooms only if empty
    await seedRooms();

    // 3) Clear & seed inventory
    await initializeInventory();

    console.log("✅ Database initialization complete");
    databaseReady = true;
    return true;
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    databaseReady = true; // mark ready so server still starts
    return false;
  }
}

function isDatabaseReady() {
  return databaseReady;
}

function getInitStatus() {
  return {
    tablesInitialized,
    inventoryInitialized,
    databaseReady,
  };
}

module.exports = {
  initializeDatabase,
  isDatabaseReady,
  getInitStatus,
};
