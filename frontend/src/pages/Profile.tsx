import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Bookmark as BookmarkIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  TrendingUp as TrendingUpIcon,
  Movie as MovieIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { authAPI } from '../services/api';
import userInteractionsService, { UserInteractionStats, UserComment } from '../services/userInteractions';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [userStats, setUserStats] = useState<UserInteractionStats | null>(null);
  const [userComments, setUserComments] = useState<UserComment[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      setStatsLoading(true);
      const [stats, comments] = await Promise.all([
        userInteractionsService.getUserStats(),
        userInteractionsService.getUserComments(),
      ]);
      setUserStats(stats);
      setUserComments(comments);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.user);
      setSuccess(
        language === 'kin'
          ? 'Profil yahinduwe neza'
          : 'Profile updated successfully'
      );
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (!user) {
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 'bold', mb: 4 }}
      >
        {t('profile.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label={t('profile.personalInfo')} />
          <Tab label={t('profile.activity')} />
          <Tab label={t('profile.comments')} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
                gap: 4,
              }}
            >
              {/* Avatar Section */}
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      fontSize: '3rem',
                      mb: 2,
                      bgcolor: 'primary.main',
                    }}
                    src={user.avatarUrl}
                  >
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </Avatar>
                  <Typography variant="h6" sx={{ textAlign: 'center' }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center' }}
                  >
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              {/* Profile Form */}
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Typography variant="h6">
                    {language === 'kin'
                      ? "Amakuru y'umukoresha"
                      : 'User Information'}
                  </Typography>
                  {!editing && (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setEditing(true)}
                    >
                      {t('common.edit')}
                    </Button>
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label={language === 'kin' ? 'Izina ryambere' : 'First Name'}
                    value={formData.firstName}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    disabled={!editing}
                    fullWidth
                  />

                  <TextField
                    label={language === 'kin' ? 'Izina ryanyuma' : 'Last Name'}
                    value={formData.lastName}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, lastName: e.target.value }))
                    }
                    disabled={!editing}
                    fullWidth
                  />

                  <TextField
                    label={language === 'kin' ? 'Imeli' : 'Email'}
                    value={formData.email}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, email: e.target.value }))
                    }
                    disabled={!editing}
                    fullWidth
                    type="email"
                  />

                  <TextField
                    label={language === 'kin' ? 'Telefone' : 'Phone'}
                    value={formData.phone}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, phone: e.target.value }))
                    }
                    disabled={!editing}
                    fullWidth
                  />
                </Box>

                {editing && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {t('common.save')}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      {t('common.cancel')}
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Account Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {language === 'kin' ? "Amakuru y'akonti" : 'Account Information'}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {language === 'kin' ? 'Ubwoko bwakonti' : 'Account Type'}
                  </Typography>
                  <Typography variant="body1">
                    {user.role === 'ADMIN'
                      ? language === 'kin'
                        ? 'Umuyobozi'
                        : 'Administrator'
                      : language === 'kin'
                        ? 'Umukoresha'
                        : 'User'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {language === 'kin' ? 'Yinjizemo' : 'Joined'}
                  </Typography>
                  <Typography variant="body1">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Activity Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            {t('profile.activity')}
          </Typography>
          
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
              gap: 3 
            }}>
              {/* Statistics Cards */}
              <Card sx={{ backgroundColor: '#1F1F1F', border: '1px solid #333' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <BookmarkIcon sx={{ fontSize: 40, color: '#E50914', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#E50914' }}>
                    {userStats?.totalWatchlistItems || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('profile.watchlistItems')}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ backgroundColor: '#1F1F1F', border: '1px solid #333' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <StarIcon sx={{ fontSize: 40, color: '#FFD700', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                    {userStats?.totalRatings || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('profile.ratings')}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ backgroundColor: '#1F1F1F', border: '1px solid #333' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CommentIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    {userStats?.totalComments || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('profile.comments')}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ backgroundColor: '#1F1F1F', border: '1px solid #333' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                    {userStats?.averageRating?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('profile.avgRating')}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Quick Actions */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('profile.quickActions')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<BookmarkIcon />}
                onClick={() => navigate('/watchlist')}
                sx={{
                  backgroundColor: '#E50914',
                  '&:hover': { backgroundColor: '#B71C1C' },
                }}
              >
                {t('movie.viewWatchlist')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<MovieIcon />}
                onClick={() => navigate('/movies')}
                sx={{
                  borderColor: '#E50914',
                  color: '#E50914',
                  '&:hover': { backgroundColor: 'rgba(229, 9, 20, 0.1)' },
                }}
              >
                {t('movie.browseMovies')}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Comments Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            {t('profile.myComments')}
          </Typography>
          
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : userComments.length === 0 ? (
            <Card sx={{ backgroundColor: '#1F1F1F', border: '1px solid #333' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CommentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {t('profile.noComments')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('profile.noCommentsDescription')}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/movies')}
                  sx={{
                    backgroundColor: '#E50914',
                    '&:hover': { backgroundColor: '#B71C1C' },
                  }}
                >
                  {t('movie.browseMovies')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {userComments.map((comment) => (
                <Card key={comment._id} sx={{ backgroundColor: '#1F1F1F', border: '1px solid #333' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {comment.movie?.title || t('common.unknownMovie')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.createdAt || '').toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {comment.comment}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={() => navigate(`/movies/${comment.movieId}`)}
                        sx={{
                          backgroundColor: '#E50914',
                          color: 'white',
                          '&:hover': { backgroundColor: '#B71C1C' },
                        }}
                      >
                        {t('movie.viewMovie')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Profile;
