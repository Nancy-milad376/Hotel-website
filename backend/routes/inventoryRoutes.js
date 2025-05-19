const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const inventoryService = require('../utils/inventoryService');
const dbInit = require('../utils/databaseInit');

// Middleware to check if database is ready
const checkDatabaseReady = (req, res, next) => {
  if (!dbInit.isDatabaseReady()) {
    return res.status(503).json({ 
      message: 'Database is still initializing. Please try again in a moment.',
      status: dbInit.getInitStatus()
    });
  }
  next();
};

/**
 * @route   GET /api/inventory
 * @desc    Get current inventory status for all room types
 * @access  Private/Admin
 */
router.get('/', protect, admin, checkDatabaseReady, async (req, res) => {
  try {
    const inventory = await inventoryService.getInventoryStatus();
    res.json(inventory);
  } catch (error) {
    console.error('Error getting inventory status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/inventory/availability
 * @desc    Check availability for a specified date range
 * @access  Public
 */
router.get('/availability', checkDatabaseReady, async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = req.query;

    // Validate required fields
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Please provide check-in and check-out dates' });
    }

    // Validate date format and range
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (startDate >= endDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    const availability = await inventoryService.getAvailabilityForDateRange(checkInDate, checkOutDate);
    res.json(availability);
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/inventory/:roomType/availability
 * @desc    Check availability for a specific room type and date range
 * @access  Public
 */
router.get('/:roomType/availability', checkDatabaseReady, async (req, res) => {
  try {
    const { roomType } = req.params;
    const { checkInDate, checkOutDate, rooms = 1 } = req.query;

    // Validate required fields
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Please provide check-in and check-out dates' });
    }

    // Validate date format and range
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (startDate >= endDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    const availability = await inventoryService.checkAvailability(
      roomType,
      checkInDate,
      checkOutDate,
      parseInt(rooms, 10)
    );
    res.json(availability);
  } catch (error) {
    console.error('Error checking room type availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
