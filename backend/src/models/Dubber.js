const mongoose = require('mongoose');

const dubberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Dubber name is required'],
    trim: true,
    maxlength: [100, 'Dubber name cannot exceed 100 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  avatarUrl: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better performance
dubberSchema.index({ slug: 1 });
dubberSchema.index({ name: 1 });

// Generate slug from name before saving
dubberSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

module.exports = mongoose.model('Dubber', dubberSchema);
