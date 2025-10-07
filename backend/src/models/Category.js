const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  nameEn: {
    type: String,
    required: [true, 'English name is required'],
    trim: true,
    maxlength: [100, 'English name cannot exceed 100 characters']
  },
  nameKin: {
    type: String,
    required: [true, 'Kinyarwanda name is required'],
    trim: true,
    maxlength: [100, 'Kinyarwanda name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  descriptionEn: {
    type: String,
    trim: true,
    maxlength: [500, 'English description cannot exceed 500 characters']
  },
  descriptionKin: {
    type: String,
    trim: true,
    maxlength: [500, 'Kinyarwanda description cannot exceed 500 characters']
  },
  iconUrl: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better performance
categorySchema.index({ slug: 1 });
categorySchema.index({ nameEn: 1 });
categorySchema.index({ nameKin: 1 });

// Generate slug from English name before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('nameEn') && !this.slug) {
    this.slug = this.nameEn
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
