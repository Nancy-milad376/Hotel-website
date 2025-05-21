// bookingRoutes.js
const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
//const { protect, admin } = require("../middleware/authMiddleware");

// Protected routes (user)
router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBookings);
router.get("/mybookings", bookingController.getMyBookings);
router.get("/:id", bookingController.getBookingById);
router.put("/:id/pay", bookingController.updateBookingToPaid);
router.put("/:id/cancel", bookingController.cancelBooking);

// Protected routes (admin only)
router.put("/:id/status", bookingController.updateBookingStatus);

module.exports = router;
