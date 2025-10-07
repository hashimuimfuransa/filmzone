const Movie = require('../models/Movie');
const User = require('../models/User');
const Category = require('../models/Category');
const Dubber = require('../models/Dubber');
const Review = require('../models/Review');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const [
      totalMovies,
      totalUsers,
      totalCategories,
      totalDubbers,
      totalReviews,
      approvedReviews
    ] = await Promise.all([
      Movie.countDocuments({ isActive: true }),
      User.countDocuments(),
      Category.countDocuments(),
      Dubber.countDocuments(),
      Review.countDocuments(),
      Review.countDocuments({ approved: true })
    ]);

    // Get total views and average rating
    const movies = await Movie.find({ isActive: true });
    const totalViews = movies.reduce((sum, movie) => sum + movie.views, 0);
    const averageRating = movies.length > 0 
      ? movies.reduce((sum, movie) => sum + movie.rating, 0) / movies.length 
      : 0;

    // Get recent movies
    const recentMovies = await Movie.find({ isActive: true })
      .populate('categories', 'nameEn nameKin')
      .populate('dubberId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get top categories
    const categoryStats = await Movie.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.nameEn', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get top dubbers
    const dubberStats = await Movie.aggregate([
      { $match: { isActive: true, dubberId: { $exists: true } } },
      { $group: { _id: '$dubberId', count: { $sum: 1 } } },
      { $lookup: { from: 'dubbers', localField: '_id', foreignField: '_id', as: 'dubber' } },
      { $unwind: '$dubber' },
      { $project: { name: '$dubber.name', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get monthly movie uploads (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyUploads = await Movie.aggregate([
      { $match: { isActive: true, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      message: 'Dashboard stats retrieved successfully',
      stats: {
        totalMovies,
        totalUsers,
        totalCategories,
        totalDubbers,
        totalReviews,
        approvedReviews,
        totalViews,
        averageRating: Math.round(averageRating * 10) / 10,
        recentMovies,
        categoryStats,
        dubberStats,
        monthlyUploads
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error retrieving dashboard stats' });
  }
};

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get views over time
    const viewsOverTime = await Movie.aggregate([
      { $match: { isActive: true, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalViews: { $sum: '$views' },
          movieCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get most viewed movies
    const mostViewedMovies = await Movie.find({ isActive: true })
      .populate('categories', 'nameEn nameKin')
      .populate('dubberId', 'name')
      .sort({ views: -1 })
      .limit(10);

    // Get highest rated movies
    const highestRatedMovies = await Movie.find({ 
      isActive: true, 
      rating: { $gt: 0 } 
    })
      .populate('categories', 'nameEn nameKin')
      .populate('dubberId', 'name')
      .sort({ rating: -1 })
      .limit(10);

    res.json({
      message: 'Analytics retrieved successfully',
      analytics: {
        period,
        viewsOverTime,
        mostViewedMovies,
        highestRatedMovies
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving analytics' });
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics
};
