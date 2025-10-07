import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { formatDuration } from '../utils/helpers';

interface Movie {
  _id: string;
  titleEn: string;
  titleKin: string;
  descriptionEn: string;
  descriptionKin: string;
  year: number;
  durationMinutes: number;
  posterUrl?: string;
  trailerYoutubeUrl?: string;
  isDubbed: boolean;
  dubberId?: {
    _id: string;
    name: string;
    slug: string;
  };
  categories: Array<{
    _id: string;
    nameEn: string;
    nameKin: string;
  }>;
  views: number;
  rating: number;
  season?: number;
  episode?: number;
}

interface MovieCardProps {
  movie: Movie;
  showActions?: boolean;
  onToggleFavorite?: (movieId: string) => void;
  isFavorite?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  showActions = true,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const title = language === 'kin' ? movie.titleKin : movie.titleEn;
  const description =
    language === 'kin' ? movie.descriptionKin : movie.descriptionEn;

  const handleWatch = () => {
    navigate(`/movies/${movie._id}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(movie._id);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={handleWatch}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="300"
          image={movie.posterUrl || '/placeholder-movie.jpg'}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />

        {/* Favorite Button */}
        {onToggleFavorite && (
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)',
              },
            }}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        )}

        {/* Series Badge */}
        {movie.season && movie.episode && (
          <Chip
            label={`S${movie.season}E${movie.episode}`}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom noWrap>
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
          }}
        >
          {description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={`${movie.year}`} size="small" variant="outlined" />
          <Chip
            label={formatDuration(movie.durationMinutes)}
            size="small"
            variant="outlined"
          />
          {movie.isDubbed && (
            <Chip
              label={language === 'kin' ? 'Ivugirwa' : 'Dubbed'}
              size="small"
              color="primary"
            />
          )}
        </Box>

        {movie.dubberId && (
          <Typography
            variant="caption"
            color="primary"
            sx={{ mb: 1, display: 'block' }}
          >
            {language === 'kin' ? 'Umuvugizi:' : 'Dubber:'}{' '}
            {movie.dubberId.name}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StarIcon sx={{ fontSize: 16, color: 'gold' }} />
            <Typography variant="caption">{movie.rating.toFixed(1)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ViewIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{movie.views}</Typography>
          </Box>
        </Box>
      </CardContent>

      {showActions && (
        <CardActions>
          <Button
            size="small"
            startIcon={<PlayIcon />}
            onClick={e => {
              e.stopPropagation();
              handleWatch();
            }}
          >
            {t('movie.watchNow')}
          </Button>
          <Button
            size="small"
            startIcon={<DownloadIcon />}
            onClick={e => {
              e.stopPropagation();
              handleWatch();
            }}
          >
            {t('movie.downloadMovie')}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default MovieCard;
