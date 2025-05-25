// controllers/roomController.js
const db = require("../models");
const { Op } = require("sequelize");

// Helper function for booking overlap condition
const getOverlapCondition = (checkIn, checkOut) => ({
  [Op.and]: [
    { checkInDate: { [Op.lt]: checkOut } },
    { checkOutDate: { [Op.gt]: checkIn } },
  ],
});

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res) => {
  try {
    const { type, minPrice, maxPrice } = req.query;
    const filter = {};

    if (type) filter.type = type;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) filter.price[Op.lte] = parseFloat(maxPrice);
    }

    const rooms = await db.room.findAll({
      where: filter,
      order: [["createdAt", "DESC"]],
    });

    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoomById = async (req, res) => {
  try {
    const room = await db.room.findByPk(req.params.id, {
      include: [
        {
          model: db.review,
          include: [{ model: db.user, attributes: ["id", "name"] }],
        },
      ],
    });

    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Public
exports.createRoom = async (req, res) => {
  try {
    const { features = [], ...roomData } = req.body;

    const newRoom = await db.room.create({
      ...roomData,
      features: Array.isArray(features) ? features : [features],
      availability:
        roomData.availability !== undefined ? roomData.availability : true,
    });

    res.status(201).json(newRoom);
  } catch (error) {
    handleSequelizeError(error, res);
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Public
exports.updateRoom = async (req, res) => {
  try {
    const room = await db.room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const updated = await room.update(req.body);
    res.json(updated);
  } catch (error) {
    handleSequelizeError(error, res);
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Public
exports.deleteRoom = async (req, res) => {
  try {
    const room = await db.room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    await room.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get room availability
// @route   GET /api/rooms/availability
// @access  Public
exports.getRoomAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    validateDates(checkIn, checkOut, res);

    const rooms = await db.room.findAll();
    const availabilityData = await calculateAvailability(
      rooms,
      checkIn,
      checkOut
    );

    res.json(availabilityData);
  } catch (error) {
    console.error("Availability error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get rooms with availability data
// @route   GET /api/rooms/with-availability
// @access  Public
exports.getRoomsWithAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    console.log("Received availability request with dates:", req.query);

    if (!checkIn || !checkOut) {
      return res
        .status(400)
        .json({ message: "Please supply checkIn & checkOut" });
    }

    // 1) load all rooms
    const rooms = await db.room.findAll();
    console.log(
      "Found rooms:",
      rooms.map((r) => r.id)
    );

    // 2) load all overlapping bookings in one go
    const bookings = await db.booking.findAll({
      where: {
        [Op.and]: [
          { checkInDate: { [Op.lt]: checkOut } },
          { checkOutDate: { [Op.gt]: checkIn } },
          { status: { [Op.not]: "cancelled" } },
        ],
      },
    });

    // 3) count how many rooms of each type are booked
    const bookedCountByType = bookings.reduce((acc, b) => {
      const room = rooms.find((r) => r.id === b.roomId);
      if (room) {
        acc[room.type] = (acc[room.type] || 0) + b.numberOfRooms;
      }
      if (!room) {
        console.warn("Booking references unknown roomId:", b.roomId);
      }
      return acc;
    }, {});

    // 4) load inventory totals
    const inventories = await db.roominventory.findAll();
    const totalByType = inventories.reduce((acc, inv) => {
      acc[inv.roomType] = inv.totalRooms;
      return acc;
    }, {});

    // 5) build the array you actually return
    const roomsWithAvailability = rooms.map((room) => {
      const total = totalByType[room.type] || 0;
      const booked = bookedCountByType[room.type] || 0;
      const available = Math.max(total - booked, 0);

      return {
        id: room.id,
        name: room.name,
        type: room.type,
        price: room.price,
        availability: available > 0,
        totalRooms: total,
        bookedRooms: booked,
        availableRooms: available,
      };
    });

    res.json(roomsWithAvailability);
  } catch (error) {
    console.error("Full error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Check specific room availability
// @route   POST /api/rooms/check-availability
// @access  Public
exports.checkRoomAvailability = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;
    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const room = await db.room.findByPk(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const availabilityData = await getRoomAvailabilityData(
      room,
      checkInDate,
      checkOutDate
    );
    res.json({
      ...availabilityData,
      message: availabilityData.available ? "Available" : "Fully booked",
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper functions
const handleSequelizeError = (error, res) => {
  console.error(error);
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "Validation error",
      errors: error.errors.map((err) => err.message),
    });
  }
  res.status(500).json({ message: "Server error" });
};

const validateDates = (checkIn, checkOut, res) => {
  if (!checkIn || !checkOut) {
    return res.status(400).json({ message: "Missing date parameters" });
  }
};

const calculateAvailability = async (rooms, checkIn, checkOut) => {
  const availability = await Promise.all(
    rooms.map((room) => getRoomAvailabilityData(room, checkIn, checkOut))
  );

  return availability.reduce((acc, curr) => {
    acc[curr.roomType] = curr;
    return acc;
  }, {});
};

const getRoomAvailabilityData = async (room, checkIn, checkOut) => {
  const bookingsCount = await db.booking.count({
    where: {
      roomId: room.id,
      ...getOverlapCondition(checkIn, checkOut),
    },
  });

  return {
    roomType: room.type,
    availableRooms: Math.max(room.totalRooms - bookingsCount, 0),
    totalRooms: room.totalRooms,
    available: room.totalRooms - bookingsCount > 0,
  };
};
