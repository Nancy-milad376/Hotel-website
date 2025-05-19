const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoomById);
router.post('/check-availability', roomController.checkRoomAvailability);

// Protected routes (admin only)
router.post('/', protect, admin, roomController.createRoom);
router.put('/:id', protect, admin, roomController.updateRoom);
router.delete('/:id', protect, admin, roomController.deleteRoom);

module.exports = router;
