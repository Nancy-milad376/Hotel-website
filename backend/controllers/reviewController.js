// controllers/reviewController.js
const db = require("../models");
const Review = db.review;
const Room = db.room;
const User = db.user; // in case you ever want to show who left it

// @desc    Create new review
// @route   POST /api/reviews
// @access  Public
exports.createReview = async (req, res) => {
  try {
    const { roomId, rating, comment } = req.body;
    if (!roomId || !rating || !comment) {
      return res
        .status(400)
        .json({ message: "Please provide roomId, rating and comment" });
    }

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const review = await Review.create({
      rating: Number(rating),
      comment,
      userId: null,
      roomId,
    });

    // Re-fetch room to get updated rating & count (your afterCreate hook will have run)
    const updatedRoom = await Room.findByPk(roomId);

    res.status(201).json({
      review,
      roomRating: updatedRoom.rating,
      numReviews: updatedRoom.numReviews,
      message: "Review added successfully",
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all reviews (optionally filter by roomId)
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { roomId } = req.query;
    const where = {};
    if (roomId) where.roomId = roomId;

    const reviews = await Review.findAll({
      where,
      include: [
        { model: User, attributes: ["id", "name"] },
        { model: Room, attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all reviews by “current user” (public—returns those with null userId)
// @route   GET /api/reviews/myreviews
// @access  Public
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: null },
      include: [{ model: Room, attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single review by ID
// @route   GET /api/reviews/:id
// @access  Public
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ["id", "name"] },
        { model: Room, attributes: ["id", "name"] },
      ],
    });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Public
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.rating = rating !== undefined ? Number(rating) : review.rating;
    review.comment = comment !== undefined ? comment : review.comment;
    await review.save();

    // Re-fetch room
    const updatedRoom = await Room.findByPk(review.roomId);

    res.json({
      review,
      roomRating: updatedRoom.rating,
      numReviews: updatedRoom.numReviews,
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Public
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const roomId = review.roomId;
    await review.destroy();

    // Re-fetch room
    const updatedRoom = await Room.findByPk(roomId);

    res.json({
      message: "Review removed",
      roomRating: updatedRoom.rating,
      numReviews: updatedRoom.numReviews,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error" });
  }
};
