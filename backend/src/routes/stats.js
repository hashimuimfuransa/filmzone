const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalytics
} = require('../controllers/statsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Admin routes
router.get('/dashboard', authenticateToken, requireAdmin, getDashboardStats);
router.get('/analytics', authenticateToken, requireAdmin, getAnalytics);

module.exports = router;
