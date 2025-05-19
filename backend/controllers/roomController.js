const db = require('../models');
const Room = db.Room;
const { Op } = require('sequelize');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, availability } = req.query;

    // Build filter object
    const filter = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (availability) {
      filter.availability = availability === 'true';
    }
    
    if (minPrice && maxPrice) {
      filter.price = {
        [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)]
      };
    } else if (minPrice) {
      filter.price = {
        [Op.gte]: parseFloat(minPrice)
      };
    } else if (maxPrice) {
      filter.price = {
        [Op.lte]: parseFloat(maxPrice)
      };
    }

    const rooms = await Room.findAll({
      where: filter,
      order: [['createdAt', 'DESC']]
    });

    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id, {
      include: [{
        model: db.Review,
        as: 'Reviews',
        include: [{
          model: db.User,
          as: 'User',
          attributes: ['id', 'name']
        }]
      }]
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private/Admin
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
      availability
    } = req.body;

    const newRoom = await Room.create({
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
      availability: availability !== undefined ? availability : true
    });

    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

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
      availability
    } = req.body;

    await room.update({
      name: name || room.name,
      description: description || room.description,
      price: price || room.price,
      mainImage: mainImage || room.mainImage,
      images: images || room.images,
      type: type || room.type,
      adultCapacity: adultCapacity || room.adultCapacity,
      childrenCapacity: childrenCapacity !== undefined ? childrenCapacity : room.childrenCapacity,
      features: features || room.features,
      size: size || room.size,
      beds: beds || room.beds,
      availability: availability !== undefined ? availability : room.availability
    });

    res.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await room.destroy();

    res.json({ message: 'Room removed' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check room availability for specific dates
// @route   POST /api/rooms/check-availability
// @access  Public
exports.checkRoomAvailability = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;

    // Validate required fields
    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Please provide roomId, checkInDate and checkOutDate' });
    }

    // Check if room exists
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room is available
    if (!room.availability) {
      return res.json({ available: false, message: 'Room is not available for booking' });
    }

    // Check if room is booked for requested dates
    const existingBooking = await db.Booking.findOne({
      where: {
        RoomId: roomId,
        [Op.and]: [
          {
            [Op.or]: [
              {
                checkInDate: {
                  [Op.between]: [checkInDate, checkOutDate]
                }
              },
              {
                checkOutDate: {
                  [Op.between]: [checkInDate, checkOutDate]
                }
              },
              {
                [Op.and]: [
                  {
                    checkInDate: {
                      [Op.lte]: checkInDate
                    }
                  },
                  {
                    checkOutDate: {
                      [Op.gte]: checkOutDate
                    }
                  }
                ]
              }
            ]
          },
          {
            status: {
              [Op.notIn]: ['cancelled']
            }
          }
        ]
      }
    });

    if (existingBooking) {
      return res.json({ 
        available: false, 
        message: 'Room is already booked for these dates'
      });
    }

    res.json({ 
      available: true, 
      message: 'Room is available for booking',
      room
    });
  } catch (error) {
    console.error('Error checking room availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
