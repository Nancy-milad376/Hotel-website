// utils/inventoryService.js
const db = require("../models");
const { Op, Sequelize } = require("sequelize");

// Initial room types & counts (used only for first‐time initialization)
const roomTypes = [
  { type: "honeymoon", name: "Honeymoon Suite", count: 20 },
  { type: "family", name: "Family Suite", count: 10 },
  { type: "panoramic", name: "Ocean View Room", count: 25 },
  { type: "exclusive", name: "Luxury Suite", count: 30 },
  { type: "deluxe", name: "Deluxe Single Room", count: 10 },
  { type: "presidential", name: "Presidential Suite", count: 15 },
];

/**
 * Initialize inventory table once.
 */
async function initializeInventory() {
  const existing = await db.RoomInventory.count();
  if (existing > 0) {
    console.log("Inventory already initialized");
    return;
  }

  for (const { type, name, count } of roomTypes) {
    await db.RoomInventory.create({
      roomType: type,
      totalRooms: count,
      availableRooms: count,
    });
    console.log(`Initialized ${name} (${type}): ${count} rooms`);
  }
}

/**
 * Helper: get all dates [checkIn, checkOut)
 */
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let curr = new Date(startDate);
  while (curr < endDate) {
    dates.push(curr.toISOString().slice(0, 10));
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return dates;
}

/**
 * Check availability of `roomsNeeded` between two dates.
 */
async function checkAvailability(
  roomType,
  checkIn,
  checkOut,
  roomsNeeded = 1,
  options = {}
) {
  // ensure we have inventory
  const inventory = await db.RoomInventory.findOne({
    where: { roomType },
    ...options,
  });
  if (!inventory) {
    return { available: false, message: "Room type not found" };
  }

  const dates = getDatesInRange(new Date(checkIn), new Date(checkOut));

  for (const date of dates) {
    const [avail] = await db.RoomAvailability.findOrCreate({
      where: { roomType, date },
      defaults: {
        bookedRooms: 0,
        availableRooms: inventory.totalRooms,
      },
      ...options,
    });

    if (avail.availableRooms < roomsNeeded) {
      return {
        available: false,
        message: `Only ${avail.availableRooms} rooms available on ${date}`,
      };
    }
  }

  // all days have ≥ roomsNeeded
  return { available: true, message: "Rooms available" };
}

/**
 * Reserve rooms: decrement per‐day availability.
 */
async function reserveRooms(
  roomType,
  checkIn,
  checkOut,
  roomsNeeded = 1,
  options = {}
) {
  const check = await checkAvailability(
    roomType,
    checkIn,
    checkOut,
    roomsNeeded,
    options
  );
  if (!check.available) {
    return { success: false, message: check.message };
  }

  const dates = getDatesInRange(new Date(checkIn), new Date(checkOut));
  for (const date of dates) {
    await db.RoomAvailability.update(
      {
        bookedRooms: Sequelize.literal(`bookedRooms + ${roomsNeeded}`),
        availableRooms: Sequelize.literal(`availableRooms - ${roomsNeeded}`),
      },
      {
        where: { roomType, date },
        ...options,
      }
    );
  }

  return { success: true };
}

/**
 * Release rooms: increment per‐day availability.
 */
async function releaseRooms(
  roomType,
  checkIn,
  checkOut,
  roomsToRelease = 1,
  options = {}
) {
  const dates = getDatesInRange(new Date(checkIn), new Date(checkOut));
  const inventory = await db.RoomInventory.findOne({
    where: { roomType },
    ...options,
  });
  const maxRooms = inventory ? inventory.totalRooms : null;

  for (const date of dates) {
    // ensure the row exists
    const [avail] = await db.RoomAvailability.findOrCreate({
      where: { roomType, date },
      defaults: {
        bookedRooms: 0,
        availableRooms: maxRooms || 0,
      },
      ...options,
    });

    await db.RoomAvailability.update(
      {
        bookedRooms: Sequelize.literal(
          `GREATEST(bookedRooms - ${roomsToRelease}, 0)`
        ),
        availableRooms:
          maxRooms != null
            ? Sequelize.literal(
                `LEAST(availableRooms + ${roomsToRelease}, ${maxRooms})`
              )
            : Sequelize.literal(`availableRooms + ${roomsToRelease}`),
      },
      {
        where: { roomType, date },
        ...options,
      }
    );
  }

  return { success: true };
}

/**
 * Fetch current inventory snapshot
 */
async function getInventoryStatus() {
  return db.RoomInventory.findAll();
}

/**
 * Check availability for every room type in a date range
 */
async function getAvailabilityForDateRange(checkIn, checkOut) {
  const inventories = await db.RoomInventory.findAll();
  const result = {};

  for (const inv of inventories) {
    const { roomType, totalRooms } = inv;
    const check = await checkAvailability(roomType, checkIn, checkOut, 1);
    let availableRooms = 0;

    if (check.available) {
      // find min available across days
      const dates = getDatesInRange(new Date(checkIn), new Date(checkOut));
      availableRooms = totalRooms;
      for (const date of dates) {
        const avail = await db.RoomAvailability.findOne({
          where: { roomType, date },
        });
        if (avail && avail.availableRooms < availableRooms) {
          availableRooms = avail.availableRooms;
        }
      }
    }

    result[roomType] = {
      totalRooms,
      available: check.available,
      availableRooms,
      message: check.message,
    };
  }

  return result;
}

module.exports = {
  initializeInventory,
  checkAvailability,
  reserveRooms,
  releaseRooms,
  getInventoryStatus,
  getAvailabilityForDateRange,
  roomTypes,
};
