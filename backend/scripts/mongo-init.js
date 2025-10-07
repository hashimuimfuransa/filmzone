// MongoDB initialization script
db = db.getSiblingDB('filmzone');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'passwordHash', 'role'],
      properties: {
        name: { bsonType: 'string' },
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        passwordHash: { bsonType: 'string' },
        role: { enum: ['USER', 'ADMIN'] },
        country: { bsonType: 'string' },
        languagePref: { enum: ['en', 'kin'] },
        createdAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('dubbers', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'slug'],
      properties: {
        name: { bsonType: 'string' },
        bio: { bsonType: 'string' },
        slug: { bsonType: 'string' },
        createdAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('categories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['nameEn', 'nameKin', 'slug'],
      properties: {
        nameEn: { bsonType: 'string' },
        nameKin: { bsonType: 'string' },
        slug: { bsonType: 'string' }
      }
    }
  }
});

db.createCollection('movies', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['titleEn', 'titleKin', 'descriptionEn', 'descriptionKin', 'year', 'durationMinutes'],
      properties: {
        titleEn: { bsonType: 'string' },
        titleKin: { bsonType: 'string' },
        descriptionEn: { bsonType: 'string' },
        descriptionKin: { bsonType: 'string' },
        year: { bsonType: 'int', minimum: 1900, maximum: 2030 },
        durationMinutes: { bsonType: 'int', minimum: 1 },
        posterUrl: { bsonType: 'string' },
        trailerYoutubeUrl: { bsonType: 'string' },
        isDubbed: { bsonType: 'bool' },
        dubberId: { bsonType: 'objectId' },
        languages: { bsonType: 'array', items: { bsonType: 'string' } },
        videoUrl: { bsonType: 'string' },
        season: { bsonType: 'int', minimum: 1 },
        episode: { bsonType: 'int', minimum: 1 },
        categories: { bsonType: 'array', items: { bsonType: 'objectId' } },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('reviews', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'movieId', 'rating'],
      properties: {
        userId: { bsonType: 'objectId' },
        movieId: { bsonType: 'objectId' },
        rating: { bsonType: 'int', minimum: 1, maximum: 5 },
        comment: { bsonType: 'string' },
        approved: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes for better performance
db.movies.createIndex({ isDubbed: 1 });
db.movies.createIndex({ dubberId: 1 });
db.movies.createIndex({ categories: 1 });
db.movies.createIndex({ titleEn: 'text', titleKin: 'text' });
db.movies.createIndex({ createdAt: -1 });

db.users.createIndex({ email: 1 }, { unique: true });
db.dubbers.createIndex({ slug: 1 }, { unique: true });
db.categories.createIndex({ slug: 1 }, { unique: true });

db.reviews.createIndex({ movieId: 1 });
db.reviews.createIndex({ userId: 1 });
db.reviews.createIndex({ approved: 1 });

print('Database initialized successfully!');
