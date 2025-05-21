// controllers/bookingController.js
const db = require("../models");
const { Op } = require("sequelize");
const inventoryService = require("../utils/inventoryService");

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  const {
    roomId,
    checkInDate,
    checkOutDate,
    numberOfAdults,
    numberOfChildren = 0,
    numberOfRooms,
    totalPrice,
    specialRequests = "",
    paymentMethod = "credit",
  } = req.body;

  if (
    !roomId ||
    !checkInDate ||
    !checkOutDate ||
    !numberOfAdults ||
    !numberOfRooms ||
    !totalPrice
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  const t = await db.sequelize.transaction();
  try {
    // Verify room exists
    const room = await db.room.findByPk(roomId, { transaction: t });
    if (!room) {
      await t.rollback();
      return res.status(404).json({ message: "Room not found" });
    }

    // Check & reserve inventory
    const availCheck = await inventoryService.checkAvailability(
      room.type,
      checkInDate,
      checkOutDate,
      numberOfRooms,
      { transaction: t }
    );
    if (!availCheck.available) {
      await t.rollback();
      return res.status(400).json({ message: availCheck.message });
    }
    await inventoryService.reserveRooms(
      room.type,
      checkInDate,
      checkOutDate,
      numberOfRooms,
      { transaction: t }
    );

    // Create booking
    const booking = await db.booking.create(
      {
        checkInDate,
        checkOutDate,
        numberOfAdults,
        numberOfChildren,
        numberOfRooms,
        totalPrice,
        specialRequests,
        paymentMethod,
        status: "pending",
        paymentStatus: "pending",
        userId: null,
        roomId,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({ booking, message: "Booking created successfully" });
  } catch (error) {
    await t.rollback();
    console.error("Error in createBooking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Public
exports.getBookings = async (req, res) => {
  try {
    const bookings = await db.booking.findAll({
      include: [
        { model: db.room },
        {
          model: db.user,
          attributes: ["id", "name", "email", "phone"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current user bookings
// @route   GET /api/bookings/mybookings
// @access  Public
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await db.booking.findAll({
      where: { userId: req.body.userId || null },
      include: [{ model: db.room }],
      order: [["createdAt", "DESC"]],
    });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Public
exports.getBookingById = async (req, res) => {
  try {
    const booking = await db.booking.findByPk(req.params.id, {
      include: [db.room, db.user],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update booking payment to paid
// @route   PUT /api/bookings/:id/pay
// @access  Public
exports.updateBookingToPaid = async (req, res) => {
  try {
    const booking = await db.booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Public
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await db.booking.findByPk(req.params.id, {
      include: [db.room],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (["cancelled", "completed"].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: `Cannot cancel a ${booking.status} booking` });
    }

    // Release inventory
    await inventoryService.releaseRooms(
      booking.room.type,
      booking.checkInDate,
      booking.checkOutDate,
      booking.numberOfRooms
    );

    booking.status = "cancelled";
    if (booking.paymentStatus === "paid") {
      booking.paymentStatus = "refunded";
    }
    await booking.save();
    res.json({ booking, message: "Booking cancelled" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Public
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status)
      return res.status(400).json({ message: "Please provide status" });
    const booking = await db.booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Complete a booking
// @route   PUT /api/bookings/:id/complete
// @access  Public
exports.completeBooking = async (req, res) => {
  try {
    const booking = await db.booking.findByPk(req.params.id, {
      include: [db.room],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (["cancelled", "completed"].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: `Cannot complete a ${booking.status} booking` });
    }

    // Release future inventory
    const today = new Date().toISOString().slice(0, 10);
    if (booking.checkOutDate >= today) {
      await inventoryService.releaseRooms(
        booking.room.type,
        today,
        booking.checkOutDate,
        booking.numberOfRooms
      );
    }
    booking.status = "completed";
    await booking.save();
    res.json({ booking, message: "Booking completed" });
  } catch (error) {
    console.error("Error completing booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};
