const { body, validationResult } = require('express-validator');
const Dubber = require('../models/Dubber');
const Movie = require('../models/Movie');

// Get all dubbers
const getDubbers = async (req, res) => {
  try {
    const dubbers = await Dubber.find().sort({ name: 1 });

    res.json({
      message: 'Dubbers retrieved successfully',
      dubbers
    });
  } catch (error) {
    console.error('Get dubbers error:', error);
    res.status(500).json({ message: 'Server error retrieving dubbers' });
  }
};

// Get single dubber by ID
const getDubberById = async (req, res) => {
  try {
    const { id } = req.params;

    const dubber = await Dubber.findById(id);
    if (!dubber) {
      return res.status(404).json({ message: 'Dubber not found' });
    }

    // Get movies by this dubber
    const movies = await Movie.find({ 
      dubberId: id, 
      isActive: true 
    })
      .populate('categories', 'nameEn nameKin slug')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Dubber retrieved successfully',
      dubber,
      movies,
      movieCount: movies.length
    });
  } catch (error) {
    console.error('Get dubber error:', error);
    res.status(500).json({ message: 'Server error retrieving dubber' });
  }
};

// Get dubber by slug
const getDubberBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const dubber = await Dubber.findOne({ slug });
    if (!dubber) {
      return res.status(404).json({ message: 'Dubber not found' });
    }

    // Get movies by this dubber
    const movies = await Movie.find({ 
      dubberId: dubber._id, 
      isActive: true 
    })
      .populate('categories', 'nameEn nameKin slug')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Dubber retrieved successfully',
      dubber,
      movies,
      movieCount: movies.length
    });
  } catch (error) {
    console.error('Get dubber by slug error:', error);
    res.status(500).json({ message: 'Server error retrieving dubber' });
  }
};

// Create new dubber (admin only)
const createDubber = async (req, res) => {
  try {
    console.log('Create dubber request body:', req.body);
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Dubber validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const dubberData = req.body;
    
    // Generate slug if not provided
    if (!dubberData.slug && dubberData.name) {
      dubberData.slug = dubberData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }
    
    const dubber = new Dubber(dubberData);
    await dubber.save();

    res.status(201).json({
      message: 'Dubber created successfully',
      dubber
    });
  } catch (error) {
    console.error('Create dubber error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Dubber with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error creating dubber' });
  }
};

// Update dubber (admin only)
const updateDubber = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Update dubber request body:', req.body);

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Dubber validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const dubber = await Dubber.findById(id);
    if (!dubber) {
      return res.status(404).json({ message: 'Dubber not found' });
    }

    const updateData = { ...req.body };
    
    // Generate slug if name is being updated and slug is not provided
    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }

    const updatedDubber = await Dubber.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Dubber updated successfully',
      dubber: updatedDubber
    });
  } catch (error) {
    console.error('Update dubber error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Dubber with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error updating dubber' });
  }
};

// Delete dubber (admin only)
const deleteDubber = async (req, res) => {
  try {
    const { id } = req.params;

    const dubber = await Dubber.findById(id);
    if (!dubber) {
      return res.status(404).json({ message: 'Dubber not found' });
    }

    // Check if dubber is being used by any movies
    const moviesUsingDubber = await Movie.countDocuments({ dubberId: id });
    
    if (moviesUsingDubber > 0) {
      return res.status(400).json({ 
        message: `Cannot delete dubber. They have dubbed ${moviesUsingDubber} movie(s)` 
      });
    }

    await Dubber.findByIdAndDelete(id);

    res.json({ message: 'Dubber deleted successfully' });
  } catch (error) {
    console.error('Delete dubber error:', error);
    res.status(500).json({ message: 'Server error deleting dubber' });
  }
};

// Get movies by dubber
const getMoviesByDubber = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const dubber = await Dubber.findById(id);
    if (!dubber) {
      return res.status(404).json({ message: 'Dubber not found' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const movies = await Movie.find({ 
      dubberId: id, 
      isActive: true 
    })
      .populate('categories', 'nameEn nameKin slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments({ dubberId: id, isActive: true });

    res.json({
      message: 'Movies by dubber retrieved successfully',
      dubber: {
        id: dubber._id,
        name: dubber.name,
        slug: dubber.slug
      },
      movies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalMovies: total,
        hasNext: skip + movies.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get movies by dubber error:', error);
    res.status(500).json({ message: 'Server error retrieving movies by dubber' });
  }
};

// Validation rules
const dubberValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name required (max 100 chars)'),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio max 1000 chars'),
  body('slug').optional().matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('avatarUrl').optional().custom((value) => {
    if (!value) return true; // Allow empty/null values
    // Allow URLs, file paths, or base64 data
    if (typeof value === 'string' && value.length > 0) return true;
    return false;
  }).withMessage('Avatar URL must be a valid string')
];

module.exports = {
  getDubbers,
  getDubberById,
  getDubberBySlug,
  createDubber,
  updateDubber,
  deleteDubber,
  getMoviesByDubber,
  dubberValidation
};
