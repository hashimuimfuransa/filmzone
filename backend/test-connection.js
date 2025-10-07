const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🧪 Testing MongoDB connection...');
    
    const mongoURI = process.env.MONGO_URI;
    console.log('📍 Connection string:', mongoURI.replace(/\/\/.*@/, '//***:***@'));
    
    // Test basic connection
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds for testing
    });
    
    console.log('✅ Connection successful!');
    
    // Test a simple operation
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Test User model
    const User = require('./src/models/User');
    const userCount = await User.countDocuments();
    console.log('👥 Total users in database:', userCount);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('💡 DNS Resolution Error - Possible causes:');
      console.error('   1. Internet connection issues');
      console.error('   2. MongoDB Atlas cluster is paused');
      console.error('   3. Incorrect cluster hostname');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Authentication Error - Possible causes:');
      console.error('   1. Incorrect username/password');
      console.error('   2. User doesn\'t have access to database');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Timeout Error - Possible causes:');
      console.error('   1. IP address not whitelisted in MongoDB Atlas');
      console.error('   2. Network firewall blocking connection');
      console.error('   3. MongoDB Atlas cluster is overloaded');
    }
    
    process.exit(1);
  }
}

testConnection();
