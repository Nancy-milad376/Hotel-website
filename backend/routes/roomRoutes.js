const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
//const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", roomController.getRooms);
router.post("/check-availability", roomController.checkRoomAvailability);
router.get("/:id", roomController.getRoomById);

// Admin-only routes
router.post("/", roomController.createRoom);
router.put("/:id", roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);

module.exports = router;
