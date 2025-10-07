import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Chip,
} from '@mui/material';
import {
  Movie as MovieIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useLanguage } from '../../contexts/LanguageContext';
import { moviesAPI, categoriesAPI, dubbersAPI } from '../../services/api';

interface DashboardStats {
  totalMovies: number;
  totalCategories: number;
  totalDubbers: number;
  totalViews: number;
  totalReviews: number;
  averageRating: number;
  recentMovies: any[];
  topMovies: any[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  onClick,
}) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(18, 18, 18, 0.8)' 
          : 'white',
        backdropFilter: 'blur(20px)',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0,0,0,0.5)' 
          : '0 4px 20px rgba(0,0,0,0.1)',
        '&:hover': onClick ? { transform: 'translateY(-4px)' } : {},
      }}
      onClick={onClick}
    >
    <CardContent>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="div"
            sx={{ fontWeight: 'bold', color }}
          >
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
  );
};

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { language } = useLanguage();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load basic stats
      const [moviesRes, categoriesRes, dubbersRes] = await Promise.all([
        moviesAPI.getMovies({ limit: 1000 }),
        categoriesAPI.getCategories(),
        dubbersAPI.getDubbers({ limit: 1000 }),
      ]);

      const totalMovies = moviesRes.data.movies.length;
      const totalCategories = categoriesRes.data.categories.length;
      const totalDubbers = dubbersRes.data.dubbers.length;

      // Calculate additional stats
      const totalViews = moviesRes.data.movies.reduce(
        (sum: number, movie: any) => sum + (movie.viewCount || 0),
        0
      );
      const totalReviews = moviesRes.data.movies.reduce(
        (sum: number, movie: any) => sum + (movie.reviewCount || 0),
        0
      );

      const moviesWithRatings = moviesRes.data.movies.filter(
        (movie: any) => movie.averageRating > 0
      );
      const averageRating =
        moviesWithRatings.length > 0
          ? moviesWithRatings.reduce(
              (sum: number, movie: any) => sum + movie.averageRating,
              0
            ) / moviesWithRatings.length
          : 0;

      // Get recent movies (last 5)
      const recentMovies = moviesRes.data.movies
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      // Get top movies by views (top 5)
      const topMovies = moviesRes.data.movies
        .sort((a: any, b: any) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 5);

      setStats({
        totalMovies,
        totalCategories,
        totalDubbers,
        totalViews,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        recentMovies,
        topMovies,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
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

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 'bold', mb: 4 }}
      >
        {language === 'kin' ? 'Dashboard' : 'Dashboard'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr 1fr',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Box>
          <StatCard
            title={t('admin.manageMovies')}
            value={stats?.totalMovies || 0}
            icon={<MovieIcon sx={{ fontSize: 40 }} />}
            color="#1976d2"
            onClick={() => navigate('/admin/movies')}
          />
        </Box>
        <Box>
          <StatCard
            title={t('admin.manageCategories')}
            value={stats?.totalCategories || 0}
            icon={<CategoryIcon sx={{ fontSize: 40 }} />}
            color="#2e7d32"
            onClick={() => navigate('/admin/categories')}
          />
        </Box>
        <Box>
          <StatCard
            title={t('admin.manageDubbers')}
            value={stats?.totalDubbers || 0}
            icon={<PersonIcon sx={{ fontSize: 40 }} />}
            color="#ed6c02"
            onClick={() => navigate('/admin/dubbers')}
          />
        </Box>
        <Box>
          <StatCard
            title={language === 'kin' ? 'Amashakisha yose' : 'Total Views'}
            value={stats?.totalViews || 0}
            icon={<ViewIcon sx={{ fontSize: 40 }} />}
            color="#9c27b0"
          />
        </Box>
      </Box>

      {/* Additional Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        <Box>
          <StatCard
            title={language === 'kin' ? 'Amashakisha yose' : 'Total Reviews'}
            value={stats?.totalReviews || 0}
            icon={<StarIcon sx={{ fontSize: 40 }} />}
            color="#f57c00"
          />
        </Box>
        <Box>
          <StatCard
            title={language === 'kin' ? 'Urwego rwose' : 'Average Rating'}
            value={stats?.averageRating || 0}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="#388e3c"
          />
        </Box>
      </Box>

      {/* Recent Movies */}
      <Card sx={{ 
        mb: 4,
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(18, 18, 18, 0.8)' 
          : 'white',
        backdropFilter: 'blur(20px)',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0,0,0,0.5)' 
          : '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            {language === 'kin' ? 'Filimi nshya' : 'Recent Movies'}
          </Typography>
          {stats?.recentMovies && stats.recentMovies.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {stats.recentMovies.map((movie: any) => (
                <Box
                  key={movie._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => navigate(`/movies/${movie._id}`)}
                >
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {language === 'kin' ? movie.titleKin : movie.titleEn}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(movie.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={movie.category?.nameEn || 'No Category'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">
              {language === 'kin' ? 'Nta filimi nshya' : 'No recent movies'}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Top Movies */}
      <Card sx={{
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(18, 18, 18, 0.8)' 
          : 'white',
        backdropFilter: 'blur(20px)',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0,0,0,0.5)' 
          : '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            {language === 'kin' ? 'Filimi zikunze' : 'Top Movies'}
          </Typography>
          {stats?.topMovies && stats.topMovies.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {stats.topMovies.map((movie: any, index: number) => (
                <Box
                  key={movie._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => navigate(`/movies/${movie._id}`)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ minWidth: 30 }}
                    >
                      #{index + 1}
                    </Typography>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {language === 'kin' ? movie.titleKin : movie.titleEn}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {movie.viewCount || 0}{' '}
                        {language === 'kin' ? 'amashakisha' : 'views'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={movie.category?.nameEn || 'No Category'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">
              {language === 'kin' ? 'Nta filimi' : 'No movies available'}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
