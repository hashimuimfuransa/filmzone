const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  titleEn: {
    type: String,
    required: [true, 'English title is required'],
    trim: true,
    maxlength: [200, 'English title cannot exceed 200 characters']
  },
  titleKin: {
    type: String,
    required: [true, 'Kinyarwanda title is required'],
    trim: true,
    maxlength: [200, 'Kinyarwanda title cannot exceed 200 characters']
  },
  descriptionEn: {
    type: String,
    required: [true, 'English description is required'],
    trim: true,
    maxlength: [2000, 'English description cannot exceed 2000 characters']
  },
  descriptionKin: {
    type: String,
    required: [true, 'Kinyarwanda description is required'],
    trim: true,
    maxlength: [2000, 'Kinyarwanda description cannot exceed 2000 characters']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be at least 1900'],
    max: [new Date().getFullYear() + 5, 'Year cannot be more than 5 years in the future']
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  posterUrl: {
    type: String,
    default: null
  },
  trailerYoutubeUrl: {
    type: String,
    default: null,
    match: [/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/, 'Please provide a valid YouTube URL']
  },
  isDubbed: {
    type: Boolean,
    default: false
  },
  dubberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dubber',
    default: null
  },
  languages: [{
    type: String,
    trim: true
  }],
  videoUrl: {
    type: String,
    default: null
  },
  season: {
    type: Number,
    min: [1, 'Season must be at least 1'],
    default: null
  },
  episode: {
    type: Number,
    min: [1, 'Episode must be at least 1'],
    default: null
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  views: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
movieSchema.index({ isDubbed: 1 });
movieSchema.index({ dubberId: 1 });
movieSchema.index({ categories: 1 });
movieSchema.index({ titleEn: 'text', titleKin: 'text' });
movieSchema.index({ createdAt: -1 });
movieSchema.index({ views: -1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ year: -1 });
movieSchema.index({ season: 1, episode: 1 });

// Update updatedAt before saving
movieSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for series check
movieSchema.virtual('isSeries').get(function() {
  return this.season && this.episode;
});

// Method to get related movies
movieSchema.methods.getRelatedMovies = async function() {
  const Movie = this.constructor;
  
  // Get movies by same dubber
  const sameDubberMovies = await Movie.find({
    _id: { $ne: this._id },
    dubberId: this.dubberId,
    isActive: true
  }).limit(5);

  // Get movies in same categories
  const sameCategoryMovies = await Movie.find({
    _id: { $ne: this._id },
    categories: { $in: this.categories },
    isActive: true
  }).limit(5);

  // Get next/previous episode if it's a series
  let nextEpisode = null;
  let previousEpisode = null;
  
  if (this.isSeries) {
    nextEpisode = await Movie.findOne({
      season: this.season,
      episode: this.episode + 1,
      isActive: true
    });
    
    previousEpisode = await Movie.findOne({
      season: this.season,
      episode: this.episode - 1,
      isActive: true
    });
  }

  return {
    sameDubberMovies,
    sameCategoryMovies,
    nextEpisode,
    previousEpisode
  };
};

module.exports = mongoose.model('Movie', movieSchema);
