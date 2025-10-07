const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ nameEn: 1 });

    res.json({
      message: 'Categories retrieved successfully',
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error retrieving categories' });
  }
};

// Get single category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      message: 'Category retrieved successfully',
      category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error retrieving category' });
  }
};

// Create new category (admin only)
const createCategory = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const categoryData = req.body;
    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error creating category' });
  }
};

// Update category (admin only)
const updateCategory = async (req, res) => {
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

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error updating category' });
  }
};

// Delete category (admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category is being used by any movies
    const Movie = require('../models/Movie');
    const moviesUsingCategory = await Movie.countDocuments({ categories: id });
    
    if (moviesUsingCategory > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It is being used by ${moviesUsingCategory} movie(s)` 
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error deleting category' });
  }
};

// Validation rules
const categoryValidation = [
  body('nameEn').trim().isLength({ min: 1, max: 100 }).withMessage('English name required (max 100 chars)'),
  body('nameKin').trim().isLength({ min: 1, max: 100 }).withMessage('Kinyarwanda name required (max 100 chars)'),
  body('slug').optional().matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('descriptionEn').optional().trim().isLength({ max: 500 }).withMessage('English description max 500 chars'),
  body('descriptionKin').optional().trim().isLength({ max: 500 }).withMessage('Kinyarwanda description max 500 chars'),
  body('iconUrl').optional().isURL().withMessage('Valid icon URL required')
];

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryValidation
};
