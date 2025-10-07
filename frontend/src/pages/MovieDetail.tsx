import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { moviesAPI } from '../services/api';
import MovieActions from '../components/MovieActions';

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
  videoUrl?: string;
  isDubbed: boolean;
  dubberId?: {
    _id: string;
    name: string;
    slug: string;
    bio?: string;
    avatarUrl?: string;
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
  languages: string[];
}

interface RelatedMovies {
  sameDubberMovies: Movie[];
  sameCategoryMovies: Movie[];
  nextEpisode?: Movie;
  previousEpisode?: Movie;
}

const MovieDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<RelatedMovies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      loadMovie();
    }
  }, [id]);

  const loadMovie = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await moviesAPI.getMovieById(id!);
      console.log('Movie data received:', response.data.movie);
      console.log('Video URL:', response.data.movie?.videoUrl);
      setMovie(response.data.movie);
      setRelatedMovies(response.data.relatedMovies);

      // Check if movie is in local favorites - no login required
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load movie');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchTrailer = () => {
    if (movie?.trailerYoutubeUrl) {
      setTrailerOpen(true);
    }
  };

  const handleWatchMovie = () => {
    console.log('Watch movie clicked, videoUrl:', movie?.videoUrl);
    if (movie?.videoUrl) {
      try {
        // Open video in new tab - no login required
        const newWindow = window.open(movie.videoUrl, '_blank');
        if (!newWindow) {
          // Popup blocked, try alternative method
          window.location.href = movie.videoUrl;
        }
      } catch (error) {
        console.error('Error opening video:', error);
        alert(language === 'kin' ? 'Ntibyashoboka gufungura video' : 'Cannot open video');
      }
    } else {
      alert(language === 'kin' ? 'Video ntiriboneka' : 'Video not available');
    }
  };

  const handleDownloadMovie = () => {
    console.log('Download movie clicked, videoUrl:', movie?.videoUrl);
    if (movie?.videoUrl) {
      try {
        // Direct download - no login required
        const link = document.createElement('a');
        link.href = movie.videoUrl;
        link.download = `${movie.titleEn || 'movie'}.mp4`;
        link.target = '_blank'; // Open in new tab as fallback
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        alert(language === 'kin' ? 'Download itangira!' : 'Download started!');
      } catch (error) {
        console.error('Error downloading video:', error);
        // Fallback: open video URL in new tab
        window.open(movie.videoUrl, '_blank');
        alert(language === 'kin' ? 'Download ntibyashoboka, video ryafunguwe muri tab nshya' : 'Download failed, video opened in new tab');
      }
    } else {
      alert(language === 'kin' ? 'Download ntiriboneka' : 'Download not available');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie?.titleEn || 'Movie',
          text: movie?.descriptionEn || 'Check out this movie',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'kin' ? 'URL yakoporowe!' : 'URL copied!');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Local favorites - no login required
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      const newFavorites = favorites.filter((fav: string) => fav !== id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    } else {
      favorites.push(id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {language === 'kin' ? 'Birakurura...' : 'Loading...'}
        </Typography>
      </Container>
    );
  }

  if (error || !movie) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Movie not found'}</Alert>
      </Container>
    );
  }

  const title = language === 'kin' ? movie.titleKin : movie.titleEn;
  const description = language === 'kin' ? movie.descriptionKin : movie.descriptionEn;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Hero Section with Background */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '60vh', md: '80vh' },
          backgroundImage: movie.posterUrl 
            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${movie.posterUrl})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Overlay Content */}
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: 'center',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                mb: 2,
                background: 'linear-gradient(45deg, #E50914, #ff6b6b)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {title}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Chip 
                label={`${movie.year}`} 
                sx={{ 
                  backgroundColor: 'rgba(229, 9, 20, 0.9)', 
                  color: 'white',
                  fontWeight: 'bold',
                }} 
              />
              <Chip 
                label={`${movie.durationMinutes} min`} 
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                }} 
              />
              {movie.isDubbed && (
                <Chip
                  label={language === 'kin' ? 'Filime Zisobanuye' : 'Dubbed'}
                  sx={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.9)', 
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon sx={{ color: '#FFD700', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {movie.rating.toFixed(1)}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayIcon />}
                onClick={handleWatchMovie}
                disabled={!movie.videoUrl}
                sx={{
                  backgroundColor: movie.videoUrl ? '#E50914' : 'rgba(0,0,0,0.3)',
                  '&:hover': { 
                    backgroundColor: movie.videoUrl ? '#B81D13' : 'rgba(0,0,0,0.3)' 
                  },
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                }}
              >
                {movie.videoUrl 
                  ? (language === 'kin' ? 'Gutangira' : 'Watch Now')
                  : (language === 'kin' ? 'Video ntiriboneka' : 'Video Not Available')
                }
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<PlayIcon />}
                onClick={handleWatchTrailer}
                disabled={!movie.trailerYoutubeUrl}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#E50914',
                    backgroundColor: 'rgba(229, 9, 20, 0.1)',
                  },
                }}
              >
                {language === 'kin' ? 'Reba Trailer' : 'Watch Trailer'}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' },
            gap: 6,
          }}
        >
          {/* Movie Poster Card */}
          <Box>
            <Card 
              sx={{ 
                position: 'sticky', 
                top: 20,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <CardMedia
                component="img"
                height="600"
                image={movie.posterUrl || '/placeholder-movie.jpg'}
                alt={title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 3 }}>
                {/* Quick Stats */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ color: '#FFD700', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {movie.rating.toFixed(1)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ViewIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body1">{movie.views}</Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <IconButton
                    onClick={toggleFavorite}
                    color={isFavorite ? 'error' : 'default'}
                    sx={{
                      backgroundColor: isFavorite ? 'rgba(244, 67, 54, 0.1)' : 'rgba(0,0,0,0.05)',
                      '&:hover': {
                        backgroundColor: isFavorite ? 'rgba(244, 67, 54, 0.2)' : 'rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <IconButton 
                    onClick={handleShare}
                    sx={{
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' },
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadMovie}
                    disabled={!movie.videoUrl}
                    sx={{
                      borderColor: movie.videoUrl ? '#E50914' : 'rgba(0,0,0,0.3)',
                      color: movie.videoUrl ? '#E50914' : 'rgba(0,0,0,0.3)',
                      '&:hover': {
                        backgroundColor: movie.videoUrl ? 'rgba(229, 9, 20, 0.1)' : 'rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    {movie.videoUrl 
                      ? (language === 'kin' ? 'Kuramo' : 'Download')
                      : (language === 'kin' ? 'Ntibyashoboka' : 'Not Available')
                    }
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Movie Details */}
          <Box>
            {/* Description */}
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  {language === 'kin' ? 'Ibisobanuro' : 'Synopsis'}
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                  {description}
                </Typography>
              </CardContent>
            </Card>

            {/* Movie Information */}
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  {language === 'kin' ? 'Amakuru y\'umukino' : 'Movie Information'}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {language === 'kin' ? 'Umwaka' : 'Year'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{movie.year}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {language === 'kin' ? 'Igihe' : 'Duration'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {movie.durationMinutes} {language === 'kin' ? 'iminota' : 'minutes'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {language === 'kin' ? 'Ururimi' : 'Language'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {movie.languages?.join(', ') || (language === 'kin' ? 'Kinyarwanda' : 'English')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {language === 'kin' ? 'Ibyiciro' : 'Categories'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {movie.categories.map(category => (
                        <Chip
                          key={category._id}
                          label={language === 'kin' ? category.nameKin : category.nameEn}
                          size="small"
                          sx={{
                            backgroundColor: '#E50914',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Dubber Information */}
            {movie.dubberId && (
              <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    {language === 'kin' ? 'Umuvuga' : 'Voice Actor'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {movie.dubberId.avatarUrl && (
                      <Box
                        component="img"
                        src={movie.dubberId.avatarUrl}
                        alt={movie.dubberId.name}
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #E50914',
                        }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {movie.dubberId.name}
                      </Typography>
                      {movie.dubberId.bio && (
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                          {movie.dubberId.bio}
                        </Typography>
                      )}
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate(`/dubbers/${movie.dubberId!.slug}`)}
                        sx={{
                          backgroundColor: '#E50914',
                          '&:hover': { backgroundColor: '#B81D13' },
                          px: 3,
                          py: 1,
                          fontWeight: 'bold',
                          borderRadius: 2,
                        }}
                      >
                        {language === 'kin'
                          ? 'Reba Filimi Zindi'
                          : 'View Other Movies'}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* User Interactions - No Login Required */}
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <MovieActions
                  movieId={movie._id}
                  movieTitle={title}
                  moviePoster={movie.posterUrl}
                  onRatingChange={(newRating) => {
                    setMovie(prev => prev ? { ...prev, rating: newRating } : null);
                  }}
                />
              </CardContent>
            </Card>

            {/* Related Movies */}
            {relatedMovies && (
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                    {language === 'kin' ? 'Filimi Zihuye' : 'Related Movies'}
                  </Typography>

                  {/* Same Dubber Movies */}
                  {relatedMovies.sameDubberMovies.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        {language === 'kin' ? 'Zindi za Umuvuga' : 'More from Voice Actor'}
                      </Typography>
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
                        gap: 3 
                      }}>
                        {relatedMovies.sameDubberMovies
                          .slice(0, 4)
                          .map(relatedMovie => (
                            <Card
                              key={relatedMovie._id}
                              sx={{
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                borderRadius: 2,
                                overflow: 'hidden',
                                '&:hover': {
                                  transform: 'translateY(-8px)',
                                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                },
                              }}
                              onClick={() => navigate(`/movies/${relatedMovie._id}`)}
                            >
                              <CardMedia
                                component="img"
                                height="200"
                                image={relatedMovie.posterUrl || '/placeholder-movie.jpg'}
                                alt={language === 'kin' ? relatedMovie.titleKin : relatedMovie.titleEn}
                                sx={{ objectFit: 'cover' }}
                              />
                              <CardContent sx={{ p: 2 }}>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.3,
                                    mb: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {language === 'kin' ? relatedMovie.titleKin : relatedMovie.titleEn}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {relatedMovie.year}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <StarIcon sx={{ fontSize: 16, color: '#FFD700' }} />
                                    <Typography variant="body2">
                                      {relatedMovie.rating.toFixed(1)}
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                      </Box>
                    </Box>
                  )}

                  {/* Next/Previous Episode */}
                  {(relatedMovies.nextEpisode || relatedMovies.previousEpisode) && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        {language === 'kin' ? 'Icyiciro gikurikira' : 'Episodes'}
                      </Typography>
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                        gap: 3 
                      }}>
                        {relatedMovies.previousEpisode && (
                          <Card
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              borderRadius: 2,
                              overflow: 'hidden',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                              },
                            }}
                            onClick={() => navigate(`/movies/${relatedMovies.previousEpisode!._id}`)}
                          >
                            <CardMedia
                              component="img"
                              height="150"
                              image={relatedMovies.previousEpisode!.posterUrl || '/placeholder-movie.jpg'}
                              alt={language === 'kin' ? relatedMovies.previousEpisode!.titleKin : relatedMovies.previousEpisode!.titleEn}
                              sx={{ objectFit: 'cover' }}
                            />
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {language === 'kin' ? 'Icyiciro cyabanje' : 'Previous Episode'}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {language === 'kin' ? relatedMovies.previousEpisode!.titleKin : relatedMovies.previousEpisode!.titleEn}
                              </Typography>
                            </CardContent>
                          </Card>
                        )}
                        {relatedMovies.nextEpisode && (
                          <Card
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              borderRadius: 2,
                              overflow: 'hidden',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                              },
                            }}
                            onClick={() => navigate(`/movies/${relatedMovies.nextEpisode!._id}`)}
                          >
                            <CardMedia
                              component="img"
                              height="150"
                              image={relatedMovies.nextEpisode!.posterUrl || '/placeholder-movie.jpg'}
                              alt={language === 'kin' ? relatedMovies.nextEpisode!.titleKin : relatedMovies.nextEpisode!.titleEn}
                              sx={{ objectFit: 'cover' }}
                            />
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {language === 'kin' ? 'Icyiciro gikurikira' : 'Next Episode'}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {language === 'kin' ? relatedMovies.nextEpisode!.titleKin : relatedMovies.nextEpisode!.titleEn}
                              </Typography>
                            </CardContent>
                          </Card>
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </Container>

      {/* Enhanced Trailer Dialog */}
      <Dialog
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            borderRadius: 2,
            overflow: 'hidden',
          },
        }}
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 1, sm: 2 },
            maxHeight: '90vh',
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {/* Close Button */}
          <IconButton
            onClick={() => setTrailerOpen(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              zIndex: 2,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.9)',
              },
              width: 48,
              height: 48,
            }}
          >
            <CloseIcon fontSize="large" />
          </IconButton>

          {/* Movie Title Overlay */}
          {movie && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 2,
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: 1,
                p: 1,
                maxWidth: '60%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                {language === 'kin' ? 'Trailer' : 'Trailer'}
              </Typography>
            </Box>
          )}

          {/* Video Container */}
          {movie?.trailerYoutubeUrl && (
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: '50vh', sm: '60vh', md: '70vh' },
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="iframe"
                src={getYouTubeEmbedUrl(movie.trailerYoutubeUrl)}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sx={{
                  borderRadius: { xs: 0, sm: 1 },
                }}
              />
            </Box>
          )}

          {/* Loading State */}
          {!movie?.trailerYoutubeUrl && (
            <Box
              sx={{
                height: { xs: '50vh', sm: '60vh', md: '70vh' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
              }}
            >
              <Typography variant="h6" color="white">
                {language === 'kin' ? 'Trailer ntiriboneka' : 'Trailer not available'}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MovieDetail;