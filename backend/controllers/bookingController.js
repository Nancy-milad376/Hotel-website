// controllers/bookingController.js
const { sequelize, Booking, Room, User } = require("../models");
const { Op } = require("sequelize");
const inventoryService = require("../utils/inventoryService");

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
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

  // Transaction: ensure booking + inventory change atomic
  const t = await sequelize.transaction();
  try {
    // Verify room exists
    const room = await Room.findByPk(roomId, { transaction: t });
    if (!room) {
      await t.rollback();
      return res.status(404).json({ message: "Room not found" });
    }

    // Check inventory availability and reserve
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

    // Create booking record
    const booking = await Booking.create(
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
        UserId: req.user?.id || null,
        RoomId: roomId,
      },
      { transaction: t }
    );

    await t.commit();
    return res
      .status(201)
      .json({ booking, message: "Booking created successfully" });
  } catch (error) {
    await t.rollback();
    console.error("Error in createBooking:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Room, as: "Room" },
        {
          model: User,
          as: "User",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Room, as: "Room" }],
      order: [["createdAt", "DESC"]],
    });
    return res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Room, as: "Room" },
        {
          model: User,
          as: "User",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.UserId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    return res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update booking payment to paid/confirmed
// @route   PUT /api/bookings/:id/pay
// @access  Private
exports.updateBookingToPaid = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    await booking.save();
    return res.json(booking);
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Admin: Update booking status arbitrarily
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status)
      return res.status(400).json({ message: "Please provide status" });
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = status;
    await booking.save();
    return res.json(booking);
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Complete a booking (admin)
// @route   PUT /api/bookings/:id/complete
// @access  Private/Admin
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Room }],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });
    if (["cancelled", "completed"].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: `Cannot complete a ${booking.status} booking` });
    }

    // Release any future dates if still pending checkout
    const today = new Date().toISOString().slice(0, 10);
    if (booking.checkOutDate >= today) {
      await inventoryService.releaseRooms(
        booking.Room.type,
        today,
        booking.checkOutDate,
        booking.numberOfRooms
      );
    }
    booking.status = "completed";
    await booking.save();
    return res.json({ booking, message: "Booking completed" });
  } catch (error) {
    console.error("Error completing booking:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Cancel a booking (user or admin)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Room }],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (req.user.role !== "admin" && booking.UserId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (["cancelled", "completed"].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: `Cannot cancel a ${booking.status} booking` });
    }

    // Release full stay
    await inventoryService.releaseRooms(
      booking.Room.type,
      booking.checkInDate,
      booking.checkOutDate,
      booking.numberOfRooms
    );

    booking.status = "cancelled";
    if (booking.paymentStatus === "paid") {
      booking.paymentStatus = "refunded";
    }
    await booking.save();
    return res.json({ booking, message: "Booking cancelled" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
