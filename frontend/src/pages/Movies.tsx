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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { moviesAPI, categoriesAPI, dubbersAPI } from '../services/api';

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
}

interface Category {
  _id: string;
  nameEn: string;
  nameKin: string;
  slug: string;
}

interface Dubber {
  _id: string;
  name: string;
  slug: string;
}

const Movies: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, isRwanda, defaultTab } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dubbers, setDubbers] = useState<Dubber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  );
  const [selectedDubber, setSelectedDubber] = useState(
    searchParams.get('dubber') || ''
  );
  const [selectedYear, setSelectedYear] = useState(
    searchParams.get('year') || ''
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get('sortBy') || 'createdAt'
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get('sortOrder') || 'desc'
  );
  const [activeTab, setActiveTab] = useState<'all' | 'dubbed' | 'un-dubbed'>(
    defaultTab === 'dubbed' ? 'dubbed' : 'all'
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadMovies();
  }, [
    currentPage,
    sortBy,
    sortOrder,
    activeTab,
    selectedCategory,
    selectedDubber,
    selectedYear,
    searchQuery,
  ]);

  const loadInitialData = async () => {
    try {
      const [categoriesResponse, dubbersResponse] = await Promise.all([
        categoriesAPI.getCategories(),
        dubbersAPI.getDubbers(),
      ]);

      setCategories(categoriesResponse.data.categories);
      setDubbers(dubbersResponse.data.dubbers);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  const loadMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: 12,
        sortBy,
        sortOrder,
      };

      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (selectedDubber) {
        params.dubber = selectedDubber;
      }

      if (selectedYear) {
        params.year = selectedYear;
      }

      if (activeTab === 'dubbed') {
        params.dubbed = 'true';
      } else if (activeTab === 'un-dubbed') {
        params.dubbed = 'false';
      }

      const response = await moviesAPI.getMovies(params);
      setMovies(response.data.movies);
      setTotalPages(response.data.pagination.totalPages);
      setTotalMovies(response.data.pagination.totalMovies);

      // Update URL params
      const newSearchParams = new URLSearchParams();
      if (searchQuery.trim()) newSearchParams.set('q', searchQuery.trim());
      if (selectedCategory) newSearchParams.set('category', selectedCategory);
      if (selectedDubber) newSearchParams.set('dubber', selectedDubber);
      if (selectedYear) newSearchParams.set('year', selectedYear);
      if (sortBy !== 'createdAt') newSearchParams.set('sortBy', sortBy);
      if (sortOrder !== 'desc') newSearchParams.set('sortOrder', sortOrder);
      if (activeTab !== 'all') newSearchParams.set('tab', activeTab);

      setSearchParams(newSearchParams);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadMovies();
  };

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: 'all' | 'dubbed' | 'un-dubbed'
  ) => {
    setActiveTab(newValue);
    setCurrentPage(1);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDubber('');
    setSelectedYear('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
    setSearchParams({});
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
              sx={{ mt: 1, display: 'block' }}
            >
              {language === 'kin' ? 'Umuvugizi:' : 'Dubber:'}{' '}
              {movie.dubberId.name}
            </Typography>
          )}

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

  if (loading && movies.length === 0) {
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
        gutterBottom
        sx={{ fontWeight: 'bold' }}
      >
        {t('navigation.movies')}
      </Typography>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <form onSubmit={handleSearch}>
          <TextField
            fullWidth
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </form>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('navigation.categories')}</InputLabel>
            <Select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              label={t('navigation.categories')}
            >
              <MenuItem value="all">
                {language === 'kin' ? 'Byose' : 'All'}
              </MenuItem>
              {categories.map(category => (
                <MenuItem key={category._id} value={category._id}>
                  {language === 'kin' ? category.nameKin : category.nameEn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{language === 'kin' ? 'Abasobanuzi' : t('common.dubber')}</InputLabel>
            <Select
              value={selectedDubber}
              onChange={e => setSelectedDubber(e.target.value)}
              label={language === 'kin' ? 'Abasobanuzi' : t('common.dubber')}
            >
              <MenuItem value="">
                {language === 'kin' ? 'Byose' : 'All'}
              </MenuItem>
              {dubbers.map(dubber => (
                <MenuItem key={dubber._id} value={dubber._id}>
                  {dubber.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>{t('common.year')}</InputLabel>
            <Select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              label={t('common.year')}
            >
              <MenuItem value="">
                {language === 'kin' ? 'Byose' : 'All'}
              </MenuItem>
              {Array.from(
                { length: 10 },
                (_, i) => new Date().getFullYear() - i
              ).map(year => (
                <MenuItem key={year} value={year.toString()}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('common.sort')}</InputLabel>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onChange={e => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              label={t('common.sort')}
            >
              <MenuItem value="createdAt-desc">
                {language === 'kin' ? 'Vuba' : 'Latest'}
              </MenuItem>
              <MenuItem value="createdAt-asc">
                {language === 'kin' ? 'Kera' : 'Oldest'}
              </MenuItem>
              <MenuItem value="rating-desc">
                {language === 'kin' ? "Nk'umwimerere" : 'Highest Rated'}
              </MenuItem>
              <MenuItem value="views-desc">
                {language === 'kin' ? 'Byakunze' : 'Most Viewed'}
              </MenuItem>
              <MenuItem value="titleEn-asc">
                {language === 'kin' ? 'Ku izina' : 'A-Z'}
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={clearFilters}
            size="small"
          >
            {language === 'kin' ? 'Suzuma' : 'Clear Filters'}
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={language === 'kin' ? 'Filime Zose' : t('navigation.all')} 
            value="all" 
          />
          <Tab 
            label={language === 'kin' ? 'Filime Zisobanuye' : 'Dubbed Movies'} 
            value="dubbed" 
          />
          <Tab 
            label={language === 'kin' ? 'Filime Zidasobanuye' : 'Un-dubbed Movies'} 
            value="un-dubbed" 
          />
        </Tabs>
      </Box>

      {/* Results */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body1" sx={{ mb: 2 }}>
        {language === 'kin'
          ? `Byabonetse: ${totalMovies} filimi`
          : `Found: ${totalMovies} movies`}
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

      {movies.length === 0 && !loading && (
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

export default Movies;
