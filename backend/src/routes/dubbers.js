const express = require('express');
const router = express.Router();
const {
  getDubbers,
  getDubberById,
  getDubberBySlug,
  createDubber,
  updateDubber,
  deleteDubber,
  getMoviesByDubber,
  dubberValidation
} = require('../controllers/dubberController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');

// Public routes
router.get('/', getDubbers);
router.get('/:id', getDubberById);
router.get('/slug/:slug', getDubberBySlug);
router.get('/:id/movies', getMoviesByDubber);

// Admin routes
router.post('/', authenticateToken, requireAdmin, dubberValidation, createDubber);
router.put('/:id', authenticateToken, requireAdmin, dubberValidation, updateDubber);
router.delete('/:id', authenticateToken, requireAdmin, deleteDubber);

// File upload route (admin only)
router.post('/upload/avatar', authenticateToken, requireAdmin, uploadImage.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message: 'Avatar uploaded successfully',
    url: req.file.path,
    publicId: req.file.filename
  });
});

module.exports = router;
