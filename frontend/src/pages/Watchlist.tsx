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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  BookmarkRemove as BookmarkRemoveIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import userInteractionsService, { WatchlistItem } from '../services/userInteractions';

const Watchlist: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const watchlistItems = await userInteractionsService.getWatchlist();
      setWatchlist(watchlistItems);
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (movieId: string) => {
    try {
      await userInteractionsService.removeFromWatchlist(movieId);
      setWatchlist(prev => prev.filter(item => item.movieId !== movieId));
      setDeleteDialogOpen(false);
      setMovieToDelete(null);
      showSnackbar(t('movie.removedFromWatchlist'), 'success');
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      showSnackbar(t('common.error'), 'error');
    }
  };

  const handleWatchMovie = (movieId: string) => {
    navigate(`/movies/${movieId}`);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const openDeleteDialog = (movieId: string) => {
    setMovieToDelete(movieId);
    setDeleteDialogOpen(true);
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">{t('movie.loginToViewWatchlist')}</Alert>
      </Container>
    );
  }

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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {t('movie.myWatchlist')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('movie.watchlistDescription', { count: watchlist.length })}
        </Typography>
      </Box>

      {watchlist.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom color="text.secondary">
            {t('movie.emptyWatchlist')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('movie.emptyWatchlistDescription')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/movies')}
            sx={{
              backgroundColor: '#E50914',
              '&:hover': { backgroundColor: '#B71C1C' },
            }}
          >
            {t('movie.browseMovies')}
          </Button>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, 
          gap: 3 
        }}>
          {watchlist.map((item) => (
            <Box key={item._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#1F1F1F',
                  border: '1px solid #333',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={item.movie?.posterUrl || '/placeholder-movie.jpg'}
                    alt={item.movie?.title || 'Movie'}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleWatchMovie(item.movieId)}
                      sx={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' },
                      }}
                    >
                      <PlayIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => openDeleteDialog(item.movieId)}
                      sx={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(229, 9, 20, 0.8)' },
                      }}
                    >
                      <BookmarkRemoveIcon />
                    </IconButton>
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      fontSize: '1rem',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.movie?.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ fontSize: 16, color: 'gold' }} />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {item.movie?.rating?.toFixed(1) || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ViewIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {item.movie?.views || 0}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                    {item.movie?.genre?.slice(0, 2).map((genre, index) => (
                      <Chip
                        key={index}
                        label={genre}
                        size="small"
                        sx={{
                          backgroundColor: '#333',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                    ))}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {t('movie.addedOn')}: {new Date(item.addedAt || '').toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { backgroundColor: '#1F1F1F', color: 'white' }
        }}
      >
        <DialogTitle sx={{ color: '#E50914', fontWeight: 600 }}>
          {t('movie.removeFromWatchlist')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('movie.removeFromWatchlistConfirm')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => movieToDelete && handleRemoveFromWatchlist(movieToDelete)}
            sx={{
              backgroundColor: '#E50914',
              color: 'white',
              '&:hover': { backgroundColor: '#B71C1C' },
            }}
          >
            {t('common.remove')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <MuiAlert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default Watchlist;
