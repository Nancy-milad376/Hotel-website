const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
//const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", reviewController.getReviews);
router.get("/:id", reviewController.getReviewById);

// Protected routes (user)
router.post("/", reviewController.createReview);
router.get("/myreviews", reviewController.getMyReviews);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
