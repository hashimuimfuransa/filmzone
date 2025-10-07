# Film Zone - Movie Streaming Platform

A full-featured movie streaming platform with multi-language support (Kinyarwanda & English), dubbed content prioritization for Rwanda users, and comprehensive admin dashboard.

## 🎯 Features

- **Multi-language UI**: Kinyarwanda (default for Rwanda) and English
- **Dubbed-first experience**: Dubbed movies appear first for Rwanda users
- **Movie streaming & downloads** with YouTube trailer embeds
- **Admin dashboard** for content management
- **Search by dubber** and related content recommendations
- **Cloudinary integration** for media storage
- **Secure authentication** with role-based access

## 🛠️ Tech Stack

- **Frontend**: React.js + TypeScript + Material UI + React Router + Axios + i18next
- **Backend**: Node.js + Express + JWT Auth + bcrypt
- **Database**: MongoDB + Mongoose ODM
- **Storage**: Cloudinary SDK
- **Testing**: Jest + Supertest (backend), React Testing Library (frontend)
- **Deployment**: Docker + Docker Compose

## 📂 Project Structure

```
filmzone/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   ├── scripts/             # Database initialization
│   ├── Dockerfile
│   └── package.json
├── frontend/                # React TypeScript app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── locales/         # i18n translations
│   │   └── utils/           # Utility functions
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Development environment
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB (or use Docker)
- Cloudinary account

### 1. Clone and Setup

```bash
git clone <repository-url>
cd filmzone
```

### 2. Environment Configuration

**Backend (.env):**
```bash
cp backend/env.example backend/.env
# Edit backend/.env with your values
```

**Frontend (.env.local):**
```bash
cp frontend/env.example frontend/.env.local
# Edit frontend/.env.local with your values
```

### 3. Development with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Development without Docker

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**MongoDB:**
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Movies
- `GET /api/movies` - List movies (with filters)
- `GET /api/movies/:id` - Movie details
- `GET /api/movies/trending` - Trending movies
- `POST /api/movies` - Add movie (admin)
- `PUT /api/movies/:id` - Update movie (admin)
- `DELETE /api/movies/:id` - Delete movie (admin)
- `POST /api/movies/upload/poster` - Upload poster (admin)
- `POST /api/movies/upload/video` - Upload video (admin)

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:id` - Category details
- `POST /api/categories` - Add category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Dubbers
- `GET /api/dubbers` - List dubbers
- `GET /api/dubbers/:id` - Dubber details + movies
- `GET /api/dubbers/slug/:slug` - Dubber by slug
- `GET /api/dubbers/:id/movies` - Movies by dubber
- `POST /api/dubbers` - Add dubber (admin)
- `PUT /api/dubbers/:id` - Update dubber (admin)
- `DELETE /api/dubbers/:id` - Delete dubber (admin)
- `POST /api/dubbers/upload/avatar` - Upload avatar (admin)

## 🌍 Language Logic

- **Rwanda users**: Default language = Kinyarwanda, default tab = Dubbed movies
- **Other users**: Default language = English, default tab = All movies
- Manual language switching always available

## 📦 Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/filmzone
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
ADMIN_EMAIL=admin@filmzone.com
ADMIN_PASSWORD=admin123
PORT=4000
NODE_ENV=development
```

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## 🧪 Testing

**Backend:**
```bash
cd backend
npm test
npm run test:watch
```

**Frontend:**
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve build/ directory with nginx or similar
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up -d
```

### Platform Deployment

- **Backend**: Deploy to Render, Heroku, or DigitalOcean
- **Frontend**: Deploy to Vercel, Netlify, or similar
- **Database**: Use MongoDB Atlas for production

## 📝 Complete Setup Instructions

### Step 1: Environment Setup

1. **Create Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Create a free account
   - Get your Cloud Name, API Key, and API Secret

2. **Setup Environment Files**
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your Cloudinary credentials
   
   # Frontend
   cp frontend/env.example frontend/.env.local
   # Edit frontend/.env.local with your Cloudinary credentials
   ```

### Step 2: Database Setup

**Option A: Using Docker (Recommended)**
```bash
# Start MongoDB with Docker
docker-compose up -d mongodb

# Seed the database
cd backend
npm run seed
```

**Option B: Local MongoDB**
```bash
# Install MongoDB locally
# Then run:
cd backend
npm run seed
```

### Step 3: Start Development Servers

**Option A: Using Docker (All services)**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

**Option B: Manual Start**
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Admin Login**: admin@filmzone.com / admin123

## 🎬 Features Overview

### User Features
- **Multi-language Support**: Switch between English and Kinyarwanda
- **Movie Browsing**: Browse movies by categories, year, dubber
- **Search**: Search movies by title, dubber, or category
- **Movie Details**: View detailed movie information with trailers
- **Dubbed Content**: Special section for dubbed movies
- **User Profiles**: Manage your profile and preferences

### Admin Features
- **Dashboard**: Overview of platform statistics
- **Movie Management**: Add, edit, delete movies
- **Category Management**: Manage movie categories
- **Dubber Management**: Manage voice actors/dubbers
- **File Uploads**: Upload posters and videos to Cloudinary
- **Content Moderation**: Approve and manage content

### Technical Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Authentication**: Secure JWT-based authentication
- **Role-based Access**: Admin and user roles
- **File Storage**: Cloudinary integration for media
- **Search & Filtering**: Advanced search and filtering options
- **Pagination**: Efficient data loading with pagination

## 🔧 Development Commands

### Backend Commands
```bash
cd backend
npm run dev          # Start development server
npm run start        # Start production server
npm test             # Run tests
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run seed         # Seed database with sample data
```

### Frontend Commands
```bash
cd frontend
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   docker ps
   # Or restart MongoDB
   docker-compose restart mongodb
   ```

2. **Cloudinary Upload Issues**
   - Verify your Cloudinary credentials
   - Check if your Cloudinary account has upload permissions

3. **Port Already in Use**
   ```bash
   # Change ports in environment files
   PORT=4001  # Backend
   PORT=3001  # Frontend
   ```

4. **CORS Issues**
   - Ensure frontend URL is added to backend CORS configuration
   - Check environment variables

## 📊 Database Schema

### Users
- name, email, passwordHash, role, country, languagePref

### Movies
- titleEn, titleKin, descriptionEn, descriptionKin, year, durationMinutes
- posterUrl, trailerYoutubeUrl, videoUrl, isDubbed, dubberId
- categories, views, rating, season, episode, languages

### Categories
- nameEn, nameKin, slug, descriptionEn, descriptionKin, iconUrl

### Dubbers
- name, bio, slug, avatarUrl

### Reviews
- userId, movieId, rating, comment, approved

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS protection
- Rate limiting
- Helmet security headers

## 📈 Performance Optimizations

- Database indexing
- Image optimization with Cloudinary
- Pagination for large datasets
- Lazy loading of components
- Efficient API endpoints
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, email support@filmzone.com or create an issue in the repository.

## 🎉 Success!

Your Film Zone platform is now ready! You have:

✅ Complete backend API with authentication  
✅ Full-featured React frontend  
✅ Admin dashboard for content management  
✅ Multi-language support (English & Kinyarwanda)  
✅ Cloudinary integration for media storage  
✅ Docker setup for easy deployment  
✅ Comprehensive documentation  

Enjoy building your movie streaming platform! 🎬
