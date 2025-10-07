import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Chip,
  Rating,
  Stack,
} from '@mui/material';
import {
  PlayArrow,
  Add,
  Info,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTrendingMovies, MockMovie } from '../data/mockMovies';

const Hero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [trendingMovies, setTrendingMovies] = useState<MockMovie[]>([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load mock trending movies
    const movies = getTrendingMovies();
    setTrendingMovies(movies);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (trendingMovies.length > 0) {
      const interval = setInterval(() => {
        setCurrentMovieIndex((prev) => (prev + 1) % trendingMovies.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [trendingMovies]);

  const nextMovie = () => {
    setCurrentMovieIndex((prev) => (prev + 1) % trendingMovies.length);
  };

  const prevMovie = () => {
    setCurrentMovieIndex((prev) => (prev - 1 + trendingMovies.length) % trendingMovies.length);
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '50vh',
          background: 'linear-gradient(45deg, #141414 0%, #1F1F1F 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" color="primary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (trendingMovies.length === 0) {
    // Return a fallback hero section with default content
    return (
      <Box
        sx={{
          position: 'relative',
          height: '50vh',
          overflow: 'hidden',
          background: 'linear-gradient(45deg, #141414 0%, #1F1F1F 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
            Welcome to FILMZONE
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.8 }}>
            Your ultimate destination for movies
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#E50914',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#B71C1C',
              },
            }}
          >
            Explore Movies
          </Button>
        </Box>
      </Box>
    );
  }

  const currentMovie = trendingMovies[currentMovieIndex];

  // Additional safety check
  if (!currentMovie) {
    return (
      <Box
        sx={{
          position: 'relative',
          height: '50vh',
          overflow: 'hidden',
          background: 'linear-gradient(45deg, #141414 0%, #1F1F1F 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <Typography variant="h4" color="primary">
          Loading movies...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: '50vh', sm: '55vh', md: '60vh' },
        minHeight: { xs: '300px', sm: '350px', md: '400px' },
        maxHeight: { xs: '500px', sm: '600px', md: '700px' },
        overflow: 'hidden',
        background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${currentMovie.posterUrl || '/placeholder-movie.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll', // Changed from 'fixed' to prevent layout issues
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        width: '100%',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%)',
          zIndex: 1,
        },
        // Ensure proper image scaling on all devices
        '@media (max-width: 768px)': {
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        },
        '@media (min-width: 769px) and (max-width: 1024px)': {
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        },
        '@media (min-width: 1025px)': {
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        },
      }}
    >
      {/* Navigation Arrows */}
      <IconButton
        onClick={prevMovie}
        sx={{
          position: 'absolute',
          left: { xs: 8, sm: 15, md: 20 },
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          zIndex: 2,
          width: { xs: 44, sm: 48, md: 52 },
          height: { xs: 44, sm: 48, md: 52 },
          // Better touch targets for mobile
          minWidth: '44px',
          minHeight: '44px',
          '&:hover': {
            backgroundColor: 'rgba(229, 9, 20, 0.8)',
            transform: 'translateY(-50%) scale(1.05)',
          },
          '&:active': {
            transform: 'translateY(-50%) scale(0.95)',
          },
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <ChevronLeft sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' } }} />
      </IconButton>

      <IconButton
        onClick={nextMovie}
        sx={{
          position: 'absolute',
          right: { xs: 8, sm: 15, md: 20 },
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          zIndex: 2,
          width: { xs: 44, sm: 48, md: 52 },
          height: { xs: 44, sm: 48, md: 52 },
          // Better touch targets for mobile
          minWidth: '44px',
          minHeight: '44px',
          '&:hover': {
            backgroundColor: 'rgba(229, 9, 20, 0.8)',
            transform: 'translateY(-50%) scale(1.05)',
          },
          '&:active': {
            transform: 'translateY(-50%) scale(0.95)',
          },
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <ChevronRight sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' } }} />
      </IconButton>

      {/* Content */}
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2, md: 3, lg: 4 },
          zIndex: 2,
          position: 'relative',
          minHeight: '100%',
          py: { xs: 1.5, sm: 2, md: 3, lg: 4 },
          // Ensure content doesn't overflow on small screens
          flexDirection: { xs: 'column', lg: 'row' },
          justifyContent: { xs: 'center', lg: 'flex-start' },
          // Better mobile spacing
          '& > *': {
            flexShrink: 0,
          },
        }}
      >
        {/* Movie Info */}
        <Box sx={{ 
          flex: 1, 
          maxWidth: { xs: '100%', lg: '600px' },
          textAlign: { xs: 'center', lg: 'left' },
          order: { xs: 2, lg: 1 },
          px: { xs: 1, sm: 0 }, // Add horizontal padding on mobile
        }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
              fontWeight: 800,
              mb: { xs: 1, sm: 1.5 },
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              // Prevent text overflow
              wordBreak: 'break-word',
              hyphens: 'auto',
            }}
          >
            {currentMovie.title || 'Movie Title'}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
            {(currentMovie.genre || ['Action', 'Drama']).slice(0, 3).map((genre, index) => (
              <Chip
                key={index}
                label={genre}
                size="small"
                sx={{
                  backgroundColor: 'rgba(229, 9, 20, 0.9)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  height: { xs: 24, sm: 28 },
                  '&:hover': {
                    backgroundColor: '#E50914',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </Stack>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem', lg: '1.1rem' },
              mb: { xs: 1.5, sm: 2 },
              lineHeight: 1.5,
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              display: { xs: 'none', sm: 'block' }, // Hide on very small screens
              // Prevent text overflow
              wordBreak: 'break-word',
              hyphens: 'auto',
              maxHeight: { xs: '60px', sm: '80px', md: '100px' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentMovie.description && currentMovie.description.length > 150
              ? `${currentMovie.description.substring(0, 150)}...`
              : currentMovie.description || 'An amazing movie experience awaits you.'}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: { xs: 2, sm: 3 }, alignItems: 'center', flexWrap: 'wrap' }}>
            <Rating
              value={(currentMovie.rating || 8) / 2}
              precision={0.1}
              readOnly
              size="small"
              sx={{ color: '#E50914' }}
            />
            <Typography variant="body2" sx={{ color: '#B3B3B3', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              {currentMovie.rating || 8}/10 • {currentMovie.releaseYear || 2024} • {currentMovie.duration || 120}min
            </Typography>
          </Stack>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 1, sm: 1.5 }} 
            sx={{ 
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', lg: 'flex-start' },
              alignItems: 'center',
              '& > *': {
                minWidth: { xs: 'auto', sm: 'auto' },
                flexShrink: 0,
              }
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              sx={{
                backgroundColor: '#E50914',
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 0.8, sm: 1.2, md: 1.5 },
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                fontWeight: 600,
                borderRadius: '6px',
                minWidth: { xs: '120px', sm: '140px' },
                boxShadow: '0 4px 20px rgba(229, 9, 20, 0.3)',
                '&:hover': {
                  backgroundColor: '#B71C1C',
                  boxShadow: '0 8px 30px rgba(229, 9, 20, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {t('Play')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Add />}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 0.8, sm: 1.2, md: 1.5 },
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                fontWeight: 600,
                borderRadius: '6px',
                minWidth: { xs: '120px', sm: '140px' },
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: '#E50914',
                  backgroundColor: 'rgba(229, 9, 20, 0.1)',
                  boxShadow: '0 4px 20px rgba(229, 9, 20, 0.2)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {t('My List')}
            </Button>
          </Stack>
        </Box>

        {/* Movie Poster */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'block' },
            flex: '0 0 auto',
            width: { lg: '250px', xl: '300px' },
            order: { xs: 1, lg: 2 },
            alignSelf: 'center',
          }}
        >
          <Card
            sx={{
              backgroundColor: 'transparent',
              boxShadow: 'none',
              borderRadius: 2,
              overflow: 'hidden',
              width: '100%',
            }}
          >
            <CardMedia
              component="img"
              height="auto"
              image={currentMovie.posterUrl || '/placeholder-movie.jpg'}
              alt={currentMovie.title || 'Movie'}
              sx={{
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                width: '100%',
                height: 'auto',
                aspectRatio: '2/3', // Maintain poster aspect ratio
                objectFit: 'cover',
              }}
            />
          </Card>
        </Box>
      </Box>

      {/* Movie Indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 10, sm: 15, md: 20 },
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: { xs: 0.5, sm: 1 },
          zIndex: 2,
        }}
      >
        {trendingMovies.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentMovieIndex(index)}
            sx={{
              width: { xs: 8, sm: 10, md: 12 },
              height: { xs: 8, sm: 10, md: 12 },
              borderRadius: '50%',
              backgroundColor: index === currentMovieIndex ? '#E50914' : 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: index === currentMovieIndex ? '#B71C1C' : 'rgba(255,255,255,0.5)',
                transform: 'scale(1.2)',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Hero;
