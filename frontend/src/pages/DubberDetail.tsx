import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Pagination,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { dubbersAPI } from '../services/api';

interface Dubber {
  _id: string;
  name: string;
  bio?: string;
  slug: string;
  avatarUrl?: string;
}

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
  categories: Array<{
    _id: string;
    nameEn: string;
    nameKin: string;
  }>;
  views: number;
  rating: number;
}

const DubberDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();

  const [dubber, setDubber] = useState<Dubber | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);

  useEffect(() => {
    if (slug) {
      loadDubberData();
    }
  }, [slug, currentPage]);

  const loadDubberData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dubbersAPI.getDubberBySlug(slug!);
      setDubber(response.data.dubber);
      setMovies(response.data.movies);
      setTotalMovies(response.data.movieCount);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dubber');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderMovieCard = (movie: Movie) => {
    const title = language === 'kin' ? movie.titleKin : movie.titleEn;
    const description =
      language === 'kin' ? movie.descriptionKin : movie.descriptionEn;

    return (
      <Card
        key={movie._id}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
      >
        <CardMedia
          component="img"
          height="300"
          image={movie.posterUrl || '/placeholder-movie.jpg'}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
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
            }}
          >
            {description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            <Chip label={`${movie.year}`} size="small" variant="outlined" />
            <Chip
              label={`${movie.durationMinutes}min`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={language === 'kin' ? 'Ivugirwa' : 'Dubbed'}
              size="small"
              color="primary"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ fontSize: 16, color: 'gold' }} />
              <Typography variant="caption">
                {movie.rating.toFixed(1)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ViewIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption">{movie.views}</Typography>
            </Box>
          </Box>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            startIcon={<PlayIcon />}
            onClick={() => navigate(`/movies/${movie._id}`)}
          >
            {t('movie.watchNow')}
          </Button>
          <Button
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => navigate(`/movies/${movie._id}`)}
          >
            {t('movie.downloadMovie')}
          </Button>
        </CardActions>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !dubber) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Dubber not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Dubber Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 3fr' },
            gap: 3,
            alignItems: 'center',
          }}
        >
          <Box>
            <Avatar
              src={dubber.avatarUrl}
              sx={{
                width: 150,
                height: 150,
                fontSize: '3rem',
              }}
            >
              {dubber.name.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
          <Box>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              {dubber.name}
            </Typography>
            {dubber.bio && (
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                {dubber.bio}
              </Typography>
            )}
            <Typography variant="h6" color="primary">
              {language === 'kin'
                ? `Filimi ${totalMovies} zivugirwa`
                : `${totalMovies} dubbed movies`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Movies Grid */}
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 'bold', mb: 3 }}
      >
        {language === 'kin' ? 'Filimi zivugirwa' : 'Dubbed Movies'}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr',
            lg: '1fr 1fr 1fr 1fr',
          },
          gap: 3,
        }}
      >
        {movies.map(movie => (
          <Box key={movie._id}>{renderMovieCard(movie)}</Box>
        ))}
      </Box>

      {movies.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {language === 'kin' ? 'Nta filimi ziboneka' : 'No movies found'}
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default DubberDetail;
