const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', reviewController.getReviews);
router.get('/:id', reviewController.getReviewById);

// Protected routes (user)
router.post('/', protect, reviewController.createReview);
router.get('/myreviews', protect, reviewController.getMyReviews);
router.put('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
