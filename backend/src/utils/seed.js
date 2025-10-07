const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Dubber = require('../models/Dubber');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/filmzone');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Dubber.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@filmzone.com',
      password: process.env.ADMIN_PASSWORD || 'admin123', // This will be hashed by the virtual setter
      role: 'ADMIN',
      country: 'Rwanda',
      languagePref: 'kin'
    });
    await adminUser.save();
    console.log('Admin user created:', adminUser.email);

    // Create sample categories
    const categories = [
      {
        nameEn: 'Action',
        nameKin: 'Ibyabaye',
        slug: 'action',
        descriptionEn: 'High-energy movies with exciting sequences',
        descriptionKin: 'Filimi zifite imbaraga nini'
      },
      {
        nameEn: 'Comedy',
        nameKin: 'Ibyishimo',
        slug: 'comedy',
        descriptionEn: 'Funny and entertaining movies',
        descriptionKin: 'Filimi zishimisha'
      },
      {
        nameEn: 'Drama',
        nameKin: 'Ibyabaye by\'ukuri',
        slug: 'drama',
        descriptionEn: 'Serious and emotional movies',
        descriptionKin: 'Filimi zifite amagambo y\'ukuri'
      },
      {
        nameEn: 'Horror',
        nameKin: 'Ibyitangaza',
        slug: 'horror',
        descriptionEn: 'Scary and suspenseful movies',
        descriptionKin: 'Filimi zitangaza'
      },
      {
        nameEn: 'Romance',
        nameKin: 'Urukundo',
        slug: 'romance',
        descriptionEn: 'Love stories and romantic movies',
        descriptionKin: 'Filimi z\'urukundo'
      },
      {
        nameEn: 'Sci-Fi',
        nameKin: 'Ibya siyansi',
        slug: 'sci-fi',
        descriptionEn: 'Science fiction and futuristic movies',
        descriptionKin: 'Filimi z\'ubwiyunge'
      }
    ];

    for (const categoryData of categories) {
      const category = new Category(categoryData);
      await category.save();
    }
    console.log('Sample categories created');

    // Create sample dubbers
    const dubbers = [
      {
        name: 'Jean Baptiste',
        bio: 'Experienced voice actor with over 10 years in the industry',
        slug: 'jean-baptiste'
      },
      {
        name: 'Marie Claire',
        bio: 'Professional dubber specializing in drama and romance',
        slug: 'marie-claire'
      },
      {
        name: 'Paul Kagame',
        bio: 'Voice actor known for action and comedy movies',
        slug: 'paul-kagame'
      }
    ];

    for (const dubberData of dubbers) {
      const dubber = new Dubber(dubberData);
      await dubber.save();
    }
    console.log('Sample dubbers created');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
