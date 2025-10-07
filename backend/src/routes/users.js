const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  getUserActivity,
  userValidation
} = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Admin routes - all require authentication and admin role
router.get('/', authenticateToken, requireAdmin, getUsers);
router.get('/stats', authenticateToken, requireAdmin, getUserStats);
router.get('/:id', authenticateToken, requireAdmin, getUserById);
router.get('/:id/activity', authenticateToken, requireAdmin, getUserActivity);
router.put('/:id', authenticateToken, requireAdmin, userValidation, updateUser);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

module.exports = router;
