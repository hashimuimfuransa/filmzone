const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  approved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
reviewSchema.index({ movieId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ approved: 1 });
reviewSchema.index({ createdAt: -1 });

// Compound index to prevent duplicate reviews
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// Update movie rating when review is saved
reviewSchema.post('save', async function() {
  if (this.approved) {
    await this.constructor.updateMovieRating(this.movieId);
  }
});

// Update movie rating when review is deleted
reviewSchema.post('deleteOne', async function() {
  await this.constructor.updateMovieRating(this.movieId);
});

// Static method to update movie rating
reviewSchema.statics.updateMovieRating = async function(movieId) {
  const Movie = mongoose.model('Movie');
  
  const avgRating = await this.aggregate([
    { $match: { movieId: movieId, approved: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  if (avgRating.length > 0) {
    await Movie.findByIdAndUpdate(movieId, {
      rating: Math.round(avgRating[0].avgRating * 10) / 10
    });
  } else {
    await Movie.findByIdAndUpdate(movieId, { rating: 0 });
  }
};

module.exports = mongoose.model('Review', reviewSchema);
