import React from 'react';
import {
  Box,
  Typography,
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
import { MockMovie } from '../data/mockMovies';

interface MovieRowProps {
  title: string;
  movies: MockMovie[];
  category?: string;
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies, category }) => {
  const { t } = useTranslation();
  const [scrollPosition, setScrollPosition] = React.useState(0);

  const scrollLeft = () => {
    setScrollPosition((prev) => Math.max(0, prev - 300));
  };

  const scrollRight = () => {
    setScrollPosition((prev) => Math.min(prev + 300, movies.length * 200));
  };

  if (movies.length === 0) return null;

  return (
    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 1.5, sm: 2 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            fontWeight: 600,
            fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' },
          }}
        >
          {title}
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={scrollLeft}
            sx={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              '&:hover': {
                backgroundColor: 'rgba(229, 9, 20, 0.8)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
          <IconButton
            onClick={scrollRight}
            sx={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              '&:hover': {
                backgroundColor: 'rgba(229, 9, 20, 0.8)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          transform: `translateX(-${scrollPosition}px)`,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          px: { xs: 1, sm: 2 },
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        {movies.map((movie) => (
          <Card
            key={movie._id}
            sx={{
              minWidth: { xs: 140, sm: 160, md: 180, lg: 200 },
              maxWidth: { xs: 140, sm: 160, md: 180, lg: 200 },
              backgroundColor: '#1A1A1A',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.05)',
                backgroundColor: '#2A2A2A',
                borderColor: 'rgba(229, 9, 20, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(229, 9, 20, 0.2)',
                '& .movie-overlay': {
                  opacity: 1,
                },
              },
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  height: { xs: 200, sm: 240, md: 260, lg: 280 },
                  width: '100%',
                  backgroundImage: `url(${movie.posterUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              <Box
                className="movie-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
              >
                <Stack direction="row" spacing={1}>
                  <IconButton
                    sx={{
                      backgroundColor: '#E50914',
                      color: 'white',
                      width: { xs: 36, sm: 40 },
                      height: { xs: 36, sm: 40 },
                      '&:hover': {
                        backgroundColor: '#B71C1C',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <PlayArrow fontSize="small" />
                  </IconButton>
                  <IconButton
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      width: { xs: 36, sm: 40 },
                      height: { xs: 36, sm: 40 },
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                  <IconButton
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      width: { xs: 36, sm: 40 },
                      height: { xs: 36, sm: 40 },
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Info fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </Box>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  fontWeight: 600,
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {movie.title}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
                <Rating
                  value={movie.rating / 2}
                  precision={0.1}
                  readOnly
                  size="small"
                  sx={{ color: '#E50914' }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: '#B3B3B3', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                >
                  {movie.rating}/10
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{ color: '#B3B3B3', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
              >
                {movie.releaseYear} • {movie.duration}min
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default MovieRow;
