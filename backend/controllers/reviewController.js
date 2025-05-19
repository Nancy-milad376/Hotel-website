const db = require('../models');
const Review = db.Review;
const Room = db.Room;

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { roomId, rating, comment } = req.body;

    // Validate required fields
    if (!roomId || !rating || !comment) {
      return res.status(400).json({ message: 'Please provide roomId, rating and comment' });
    }

    // Check if room exists
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user already reviewed this room
    const alreadyReviewed = await Review.findOne({
      where: {
        RoomId: roomId,
        UserId: req.user.id
      }
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this room' });
    }

    // Create review
    const review = await Review.create({
      rating: Number(rating),
      comment,
      UserId: req.user.id,
      RoomId: roomId
    });

    // Get updated room
    const updatedRoom = await Room.findByPk(roomId);

    res.status(201).json({
      review,
      roomRating: updatedRoom.rating,
      numReviews: updatedRoom.numReviews,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { roomId } = req.query;

    const filter = {};
    if (roomId) {
      filter.RoomId = roomId;
    }

    const reviews = await Review.findAll({
      where: filter,
      include: [
        {
          model: db.User,
          as: 'User',
          attributes: ['id', 'name']
        },
        {
          model: db.Room,
          as: 'Room',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user reviews
// @route   GET /api/reviews/myreviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: {
        UserId: req.user.id
      },
      include: [
        {
          model: db.Room,
          as: 'Room'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        {
          model: db.User,
          as: 'User',
          attributes: ['id', 'name']
        },
        {
          model: db.Room,
          as: 'Room'
        }
      ]
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if review belongs to user
    if (review.UserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review.rating = Number(rating) || review.rating;
    review.comment = comment || review.comment;
    
    const updatedReview = await review.save();

    // Get updated room
    const updatedRoom = await Room.findByPk(review.RoomId);

    res.json({
      review: updatedReview,
      roomRating: updatedRoom.rating,
      numReviews: updatedRoom.numReviews,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if review belongs to user or user is admin
    if (review.UserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const roomId = review.RoomId;

    await review.destroy();

    // Get updated room
    const updatedRoom = await Room.findByPk(roomId);

    res.json({
      message: 'Review removed',
      roomRating: updatedRoom.rating,
      numReviews: updatedRoom.numReviews
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
