// controllers/roomController.js
const db = require("../models");
const { Op } = require("sequelize");

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, availability } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (availability !== undefined)
      filter.availability = availability === "true";

    if (minPrice && maxPrice) {
      filter.price = {
        [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)],
      };
    } else if (minPrice) {
      filter.price = { [Op.gte]: parseFloat(minPrice) };
    } else if (maxPrice) {
      filter.price = { [Op.lte]: parseFloat(maxPrice) };
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
  console.log("getRoomById invoked with id =", req.params.id);
  try {
    const room = await db.room.findByPk(req.params.id, {
      include: [
        {
          model: db.review,
          include: [
            {
              model: db.user,
              attributes: ["id", "name"],
            },
          ],
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
// @access  Public (was admin)
exports.createRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      mainImage,
      images,
      type,
      adultCapacity,
      childrenCapacity,
      features,
      size,
      beds,
      availability,
    } = req.body;

    const newRoom = await db.room.create({
      name,
      description,
      price,
      mainImage,
      images,
      type,
      adultCapacity,
      childrenCapacity,
      features,
      size,
      beds,
      availability: availability !== undefined ? availability : true,
    });

    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Public (was admin)
exports.updateRoom = async (req, res) => {
  console.log(
    "updateRoom invoked with id =",
    req.params.id,
    "body =",
    req.body
  );
  try {
    const room = await db.room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const updated = await room.update(req.body);
    res.json(updated);
  } catch (error) {
    console.error("Error updating room:", error);
    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Public (was admin)
exports.deleteRoom = async (req, res) => {
  console.log("deleteRoom invoked with id =", req.params.id);
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

// @desc    Check room availability
// @route   POST /api/rooms/check-availability
// @access  Public
exports.checkRoomAvailability = async (req, res) => {
  console.log("checkRoomAvailability invoked", req.body);
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;
    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure the room exists
    const room = await db.room.findByPk(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (!room.availability) {
      return res.json({ available: false, message: "Room not available" });
    }

    // Check for overlapping bookings
    const existingBooking = await db.booking.findOne({
      where: {
        roomId,
        status: { [Op.not]: "cancelled" },
        [Op.or]: [
          { checkInDate: { [Op.between]: [checkInDate, checkOutDate] } },
          { checkOutDate: { [Op.between]: [checkInDate, checkOutDate] } },
          {
            [Op.and]: [
              { checkInDate: { [Op.lte]: checkInDate } },
              { checkOutDate: { [Op.gte]: checkOutDate } },
            ],
          },
        ],
      },
    });

    if (existingBooking) {
      return res.json({ available: false, message: "Already booked" });
    }

    res.json({ available: true, message: "Available", room });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Server error" });
  }
};
