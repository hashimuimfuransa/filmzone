const express = require('express');
const router = express.Router();
const { 
  submitContact, 
  getContactInfo, 
  getContactMessages,
  getContactById,
  updateContact,
  markAsResponded,
  getContactStats,
  contactValidation 
} = require('../controllers/contactController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
// Get contact information (public)
router.get('/', getContactInfo);

// Submit contact form (public)
router.post('/submit', contactValidation, submitContact);

// Admin routes
// Get all contact messages (admin only)
router.get('/messages', authenticateToken, requireAdmin, getContactMessages);

// Get contact message by ID (admin only)
router.get('/messages/:id', authenticateToken, requireAdmin, getContactById);

// Update contact message (admin only)
router.put('/messages/:id', authenticateToken, requireAdmin, updateContact);

// Mark contact as responded (admin only)
router.patch('/messages/:id/responded', authenticateToken, requireAdmin, markAsResponded);

// Get contact statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, getContactStats);

module.exports = router;
