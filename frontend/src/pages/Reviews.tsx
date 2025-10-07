import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Rating,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { reviewsAPI } from '../services/api';
import { formatRelativeTime } from '../utils/helpers';

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  movieId: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

const Reviews: React.FC = () => {
  const { t } = useTranslation();
  const { movieId } = useParams<{ movieId: string }>();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    if (movieId) {
      loadReviews();
    }
  }, [movieId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reviewsAPI.getMovieReviews(movieId!);
      setReviews(response.data.reviews);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (review?: Review) => {
    if (review) {
      setEditingReview(review);
      setFormData({
        rating: review.rating,
        comment: review.comment,
      });
    } else {
      setEditingReview(null);
      setFormData({
        rating: 5,
        comment: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingReview(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingReview) {
        await reviewsAPI.updateReview(editingReview._id, formData);
      } else {
        await reviewsAPI.createReview({
          movieId,
          ...formData,
        });
      }

      handleCloseDialog();
      loadReviews();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save review');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (
      window.confirm(
        language === 'kin'
          ? 'Urashaka gusiba icyo cyanditse?'
          : 'Are you sure you want to delete this review?'
      )
    ) {
      try {
        await reviewsAPI.deleteReview(reviewId);
        loadReviews();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete review');
      }
    }
  };

  const userReview = reviews.find(review => review.userId._id === user?.id);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 'bold' }}
      >
        {language === 'kin' ? 'Ibyanditse' : 'Reviews'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Add Review Button */}
      {user && !userReview && (
        <Box sx={{ mb: 3 }}>
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            {language === 'kin' ? 'Andika icyanditse' : 'Write a Review'}
          </Button>
        </Box>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', py: 4 }}
        >
          {language === 'kin' ? 'Nta byanditse byabonetse' : 'No reviews found'}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reviews.map(review => (
            <Card key={review._id}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>
                      {review.userId.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{review.userId.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatRelativeTime(review.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {review.rating}/5
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {review.comment}
                </Typography>

                {!review.approved && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {language === 'kin'
                      ? 'Icyanditse gitegereje kwemezwa'
                      : 'Review pending approval'}
                  </Alert>
                )}

                {/* Edit/Delete buttons for user's own review */}
                {user && user.id === review.userId._id && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(review)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(review._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Add/Edit Review Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingReview
            ? language === 'kin'
              ? 'Hindura icyanditse'
              : 'Edit Review'
            : language === 'kin'
              ? 'Andika icyanditse'
              : 'Write Review'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {language === 'kin' ? 'Umwimerere' : 'Rating'}
              </Typography>
              <Rating
                value={formData.rating}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, rating: newValue || 5 }));
                }}
                size="large"
              />
            </Box>

            <TextField
              label={language === 'kin' ? 'Icyanditse' : 'Comment'}
              value={formData.comment}
              onChange={e =>
                setFormData(prev => ({ ...prev, comment: e.target.value }))
              }
              fullWidth
              multiline
              rows={4}
              placeholder={
                language === 'kin'
                  ? 'Andika icyanditse cyawe...'
                  : 'Write your review...'
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingReview
              ? t('common.save')
              : language === 'kin'
                ? 'Tanga'
                : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reviews;
