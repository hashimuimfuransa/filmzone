const { body, validationResult, query } = require('express-validator');
const Movie = require('../models/Movie');
const Category = require('../models/Category');
const Dubber = require('../models/Dubber');

// Get all movies with filters
const getMovies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      q, // search query
      dubber,
      category,
      dubbed,
      year,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    // Search by title
    if (q) {
      filter.$or = [
        { titleEn: { $regex: q, $options: 'i' } },
        { titleKin: { $regex: q, $options: 'i' } }
      ];
    }

    // Filter by dubber
    if (dubber) {
      filter.dubberId = dubber;
    }

    // Filter by category
    if (category && category !== 'all') {
      filter.categories = category;
    }

    // Filter by dubbed status
    if (dubbed !== undefined) {
      filter.isDubbed = dubbed === 'true';
    }

    // Filter by year
    if (year) {
      filter.year = parseInt(year);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const movies = await Movie.find(filter)
      .populate('categories', 'nameEn nameKin slug')
      .populate('dubberId', 'name slug avatarUrl')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Movie.countDocuments(filter);

    res.json({
      message: 'Movies retrieved successfully',
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
    console.error('Get movies error:', error);
    res.status(500).json({ message: 'Server error retrieving movies' });
  }
};

// Get single movie by ID
const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id)
      .populate('categories', 'nameEn nameKin slug')
      .populate('dubberId', 'name bio slug avatarUrl');

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Increment view count
    movie.views += 1;
    await movie.save();

    // Get related movies
    const relatedMovies = await movie.getRelatedMovies();

    res.json({
      message: 'Movie retrieved successfully',
      movie,
      relatedMovies
    });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({ message: 'Server error retrieving movie' });
  }
};

// Create new movie (admin only)
const createMovie = async (req, res) => {
  try {
    console.log('Create movie request body:', req.body);
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Movie validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const movieData = req.body;
    console.log('Movie data received:', movieData);
    console.log('Video URL in request:', movieData.videoUrl);

    // Validate categories exist
    if (movieData.categories && movieData.categories.length > 0) {
      const categories = await Category.find({ _id: { $in: movieData.categories } });
      if (categories.length !== movieData.categories.length) {
        return res.status(400).json({ message: 'One or more categories not found' });
      }
    }

    // Validate dubber exists if provided
    if (movieData.dubberId) {
      const dubber = await Dubber.findById(movieData.dubberId);
      if (!dubber) {
        return res.status(400).json({ message: 'Dubber not found' });
      }
    }

    // Auto-add "Dubbed Films" category if movie has a dubber
    if (movieData.dubberId && movieData.isDubbed) {
      let dubbedCategory = await Category.findOne({ slug: 'dubbed-films' });
      
      if (!dubbedCategory) {
        // Create the dubbed films category if it doesn't exist
        dubbedCategory = new Category({
          nameEn: 'Dubbed Films',
          nameKin: 'Filime Zisobanuye',
          slug: 'dubbed-films',
          descriptionEn: 'Movies that have been dubbed in Kinyarwanda',
          descriptionKin: 'Filimi zisobanuye mu Kinyarwanda'
        });
        await dubbedCategory.save();
        console.log('Created dubbed films category');
      }
      
      // Add the dubbed category to the movie's categories if not already present
      if (!movieData.categories) {
        movieData.categories = [];
      }
      if (!movieData.categories.includes(dubbedCategory._id.toString())) {
        movieData.categories.push(dubbedCategory._id.toString());
      }
    }

    const movie = new Movie(movieData);
    console.log('Movie object before save:', movie);
    await movie.save();
    console.log('Movie saved successfully, videoUrl:', movie.videoUrl);

    // Populate the created movie
    await movie.populate([
      { path: 'categories', select: 'nameEn nameKin slug' },
      { path: 'dubberId', select: 'name slug avatarUrl' }
    ]);

    res.status(201).json({
      message: 'Movie created successfully',
      movie
    });
  } catch (error) {
    console.error('Create movie error:', error);
    res.status(500).json({ message: 'Server error creating movie' });
  }
};

// Update movie (admin only)
const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const updateData = req.body;

    // Validate categories exist
    if (updateData.categories && updateData.categories.length > 0) {
      const categories = await Category.find({ _id: { $in: updateData.categories } });
      if (categories.length !== updateData.categories.length) {
        return res.status(400).json({ message: 'One or more categories not found' });
      }
    }

    // Validate dubber exists if provided
    if (updateData.dubberId) {
      const dubber = await Dubber.findById(updateData.dubberId);
      if (!dubber) {
        return res.status(400).json({ message: 'Dubber not found' });
      }
    }

    // Auto-add "Dubbed Films" category if movie has a dubber
    if (updateData.dubberId && updateData.isDubbed) {
      let dubbedCategory = await Category.findOne({ slug: 'dubbed-films' });
      
      if (!dubbedCategory) {
        // Create the dubbed films category if it doesn't exist
        dubbedCategory = new Category({
          nameEn: 'Dubbed Films',
          nameKin: 'Filime Zisobanuye',
          slug: 'dubbed-films',
          descriptionEn: 'Movies that have been dubbed in Kinyarwanda',
          descriptionKin: 'Filimi zisobanuye mu Kinyarwanda'
        });
        await dubbedCategory.save();
        console.log('Created dubbed films category');
      }
      
      // Add the dubbed category to the movie's categories if not already present
      if (!updateData.categories) {
        updateData.categories = [];
      }
      if (!updateData.categories.includes(dubbedCategory._id.toString())) {
        updateData.categories.push(dubbedCategory._id.toString());
      }
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'categories', select: 'nameEn nameKin slug' },
      { path: 'dubberId', select: 'name slug avatarUrl' }
    ]);

    res.json({
      message: 'Movie updated successfully',
      movie: updatedMovie
    });
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({ message: 'Server error updating movie' });
  }
};

// Delete movie (admin only)
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Soft delete by setting isActive to false
    movie.isActive = false;
    await movie.save();

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({ message: 'Server error deleting movie' });
  }
};

// Get trending movies
const getTrendingMovies = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const movies = await Movie.find({ isActive: true })
      .populate('categories', 'nameEn nameKin slug')
      .populate('dubberId', 'name slug avatarUrl')
      .sort({ views: -1, rating: -1 })
      .limit(parseInt(limit));

    res.json({
      message: 'Trending movies retrieved successfully',
      movies
    });
  } catch (error) {
    console.error('Get trending movies error:', error);
    res.status(500).json({ message: 'Server error retrieving trending movies' });
  }
};

// Validation rules
const movieValidation = [
  body('titleEn').trim().isLength({ min: 1, max: 200 }).withMessage('English title required (max 200 chars)'),
  body('titleKin').trim().isLength({ min: 1, max: 200 }).withMessage('Kinyarwanda title required (max 200 chars)'),
  body('descriptionEn').trim().isLength({ min: 1, max: 2000 }).withMessage('English description required (max 2000 chars)'),
  body('descriptionKin').trim().isLength({ min: 1, max: 2000 }).withMessage('Kinyarwanda description required (max 2000 chars)'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 5 }).withMessage('Valid year required'),
  body('durationMinutes').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('posterUrl').optional().isURL().withMessage('Valid poster URL required'),
  body('trailerYoutubeUrl').optional().isURL().withMessage('Valid YouTube URL required'),
  body('isDubbed').optional().isBoolean().withMessage('isDubbed must be boolean'),
  body('dubberId').optional().isMongoId().withMessage('Valid dubber ID required'),
  body('languages').optional().isArray().withMessage('Languages must be array'),
  body('videoUrl').optional().custom((value) => {
    if (!value || value === null || value === '') return true; // Allow empty/null values
    return /^https?:\/\/.+/.test(value); // Only validate if value exists
  }).withMessage('Valid video URL required'),
  body('season').optional().isInt({ min: 1 }).withMessage('Season must be positive integer'),
  body('episode').optional().isInt({ min: 1 }).withMessage('Episode must be positive integer'),
  body('categories').optional().isArray().withMessage('Categories must be array')
];

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getTrendingMovies,
  movieValidation
};
