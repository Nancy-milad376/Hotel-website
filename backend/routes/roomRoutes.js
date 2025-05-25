// roomRoutes.js
const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
//const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", roomController.getRooms);
router.post("/check-availability", roomController.checkRoomAvailability);
router.get("/with-availability", roomController.getRoomsWithAvailability);
router.get("/availability", roomController.getRoomAvailability);
router.get("/:id", roomController.getRoomById);

router.post("/", roomController.createRoom);
router.put("/:id", roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);

module.exports = router;
