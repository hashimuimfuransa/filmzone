const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/filmzone');
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@filmzone.com' });
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }

    console.log('Admin user found:', adminUser.email);
    console.log('Role:', adminUser.role);
    
    // Test password
    const testPassword = 'admin123';
    const isPasswordValid = adminUser.checkPassword(testPassword);
    console.log('Password test result:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('✅ Admin login should work with password: admin123');
    } else {
      console.log('❌ Admin login will fail');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error testing login:', error);
    process.exit(1);
  }
};

testLogin();
