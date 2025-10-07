import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Rating,
  TextField,
  Typography,
  Chip,
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  BookmarkAdd as BookmarkAddIcon,
  BookmarkRemove as BookmarkRemoveIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  PlayArrow as PlayIcon,
  Share as ShareIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import userInteractionsService, { UserRating, UserComment, WatchlistItem } from '../services/userInteractions';

interface MovieActionsProps {
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  onRatingChange?: (newRating: number) => void;
  onCommentAdded?: (comment: UserComment) => void;
}

const MovieActions: React.FC<MovieActionsProps> = ({
  movieId,
  movieTitle,
  moviePoster,
  onRatingChange,
  onCommentAdded,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (user) {
      loadUserInteractions();
    }
  }, [user, movieId]);

  const loadUserInteractions = async () => {
    try {
      setLoading(true);
      const [watchlistStatus, rating, movieComments] = await Promise.all([
        userInteractionsService.isInWatchlist(movieId),
        userInteractionsService.getUserRating(movieId),
        userInteractionsService.getMovieComments(movieId),
      ]);
      
      setIsInWatchlist(watchlistStatus);
      setUserRating(rating);
      setComments(movieComments);
    } catch (error) {
      console.error('Error loading user interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      if (isInWatchlist) {
        await userInteractionsService.removeFromWatchlist(movieId);
        setIsInWatchlist(false);
        showSnackbar(t('movie.removedFromWatchlist'), 'success');
      } else {
        await userInteractionsService.addToWatchlist(movieId);
        setIsInWatchlist(true);
        showSnackbar(t('movie.addedToWatchlist'), 'success');
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      showSnackbar(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (newRating: number | null) => {
    if (!user || !newRating) return;
    
    try {
      setLoading(true);
      let rating: UserRating;
      if (userRating) {
        rating = await userInteractionsService.updateRating(movieId, newRating);
      } else {
        rating = await userInteractionsService.rateMovie(movieId, newRating);
      }
      setUserRating(rating);
      onRatingChange?.(newRating);
      showSnackbar(t('movie.ratingUpdated'), 'success');
    } catch (error) {
      console.error('Error updating rating:', error);
      showSnackbar(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
    
    try {
      setLoading(true);
      const comment = await userInteractionsService.addComment(movieId, newComment.trim());
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setCommentDialogOpen(false);
      onCommentAdded?.(comment);
      showSnackbar(t('movie.commentAdded'), 'success');
    } catch (error) {
      console.error('Error adding comment:', error);
      showSnackbar(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await userInteractionsService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
      showSnackbar(t('movie.commentDeleted'), 'success');
    } catch (error) {
      console.error('Error deleting comment:', error);
      showSnackbar(t('common.error'), 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movieTitle,
          text: t('movie.shareText', { title: movieTitle }),
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSnackbar(t('movie.linkCopied'), 'success');
    }
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t('movie.loginToInteract')}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        {/* Primary Actions */}
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            size="large"
            sx={{
              backgroundColor: '#E50914',
              '&:hover': { backgroundColor: '#B71C1C' },
              minWidth: 140,
            }}
          >
            {t('movie.watchNow')}
          </Button>
          
          <Tooltip title={isInWatchlist ? t('movie.removeFromWatchlist') : t('movie.addToWatchlist')}>
            <IconButton
              onClick={handleWatchlistToggle}
              disabled={loading}
              sx={{
                backgroundColor: isInWatchlist ? '#E50914' : 'rgba(255,255,255,0.1)',
                color: 'white',
                '&:hover': {
                  backgroundColor: isInWatchlist ? '#B71C1C' : 'rgba(255,255,255,0.2)',
                },
              }}
            >
              {isInWatchlist ? <BookmarkRemoveIcon /> : <BookmarkAddIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title={t('movie.share')}>
            <IconButton
              onClick={handleShare}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Rating Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            {t('movie.yourRating')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating
              value={userRating?.rating || 0}
              onChange={(_, newValue) => handleRatingChange(newValue)}
              disabled={loading}
              size="large"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#E50914',
                },
                '& .MuiRating-iconHover': {
                  color: '#FF6B6B',
                },
              }}
            />
            {userRating && (
              <Chip
                label={`${userRating.rating}/5`}
                size="small"
                sx={{ backgroundColor: '#E50914', color: 'white' }}
              />
            )}
          </Box>
        </Box>

        {/* Comments Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('movie.comments')} ({comments.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CommentIcon />}
              onClick={() => setCommentDialogOpen(true)}
              sx={{
                borderColor: '#E50914',
                color: '#E50914',
                '&:hover': { backgroundColor: 'rgba(229, 9, 20, 0.1)' },
              }}
            >
              {t('movie.addComment')}
            </Button>
          </Box>

          {/* Comments List */}
          <Stack spacing={2}>
            {comments.map((comment) => (
              <Card key={comment._id} sx={{ backgroundColor: '#1F1F1F', border: '1px solid #333' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ backgroundColor: '#E50914' }}>
                      {comment.user?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {comment.user?.name || t('common.anonymous')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.createdAt || '').toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {comment.comment}
                      </Typography>
                      {comment.userId === user.id && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteComment(comment._id!)}
                        >
                          {t('common.delete')}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            {comments.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                {t('movie.noComments')}
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Add Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: '#1F1F1F', color: 'white' }
        }}
      >
        <DialogTitle sx={{ color: '#E50914', fontWeight: 600 }}>
          {t('movie.addComment')}
        </DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            fullWidth
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('movie.commentPlaceholder')}
            variant="outlined"
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#2A2A2A',
                '& fieldset': { borderColor: '#666' },
                '&:hover fieldset': { borderColor: '#999' },
                '&.Mui-focused fieldset': { borderColor: '#E50914' },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCommentDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleAddComment}
            disabled={!newComment.trim() || loading}
            sx={{
              backgroundColor: '#E50914',
              color: 'white',
              '&:hover': { backgroundColor: '#B71C1C' },
              '&:disabled': { backgroundColor: '#666' },
            }}
          >
            {t('movie.addComment')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MovieActions;
