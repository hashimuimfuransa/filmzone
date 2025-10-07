const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware - Increased limits for large video uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add memory management for chunked uploads
app.use((req, res, next) => {
  // Set longer timeout for chunked uploads
  if (req.path.includes('/upload/video/chunk')) {
    req.setTimeout(60 * 1000); // 1 minute per chunk
    res.setTimeout(60 * 1000);
  }
  next();
});

// Increase server timeout for large file uploads
app.use((req, res, next) => {
  // Set timeout to 10 minutes for video upload routes
  if (req.path.includes('/upload/video')) {
    req.setTimeout(600000); // 10 minutes
    res.setTimeout(600000); // 10 minutes
  }
  next();
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/filmzone';
    
    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('📍 Connection string:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds timeout
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Check your internet connection');
    console.error('   2. Verify MongoDB Atlas cluster is running');
    console.error('   3. Check IP whitelist in MongoDB Atlas');
    console.error('   4. Verify username/password in connection string');
    console.error('   5. Check if MongoDB Atlas cluster is paused');
    
    // Don't exit process, let the app continue with graceful degradation
    console.log('🔄 Will retry connection in 30 seconds...');
    setTimeout(connectDB, 30000);
  }
};

// Connect to database
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Film Zone API', 
    version: '1.0.0',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Database health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    status: dbStatus === 1 ? 'healthy' : 'unhealthy',
    database: statusMap[dbStatus],
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/movies', require('./src/routes/movies'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/dubbers', require('./src/routes/dubbers'));
app.use('/api/reviews', require('./src/routes/reviews'));
app.use('/api/stats', require('./src/routes/stats'));
app.use('/api/contact', require('./src/routes/contact'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
