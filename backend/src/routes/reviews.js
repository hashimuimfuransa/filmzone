const express = require('express');
const router = express.Router();
const {
  getMovieReviews,
  createReview,
  updateReview,
  deleteReview,
  moderateReview,
  getPendingReviews,
  reviewValidation
} = require('../controllers/reviewController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/movie/:movieId', getMovieReviews);

// Protected routes (user)
router.post('/', authenticateToken, reviewValidation, createReview);
router.put('/:reviewId', authenticateToken, reviewValidation, updateReview);
router.delete('/:reviewId', authenticateToken, deleteReview);

// Admin routes
router.get('/pending', authenticateToken, requireAdmin, getPendingReviews);
router.put('/:reviewId/moderate', authenticateToken, requireAdmin, moderateReview);

module.exports = router;
