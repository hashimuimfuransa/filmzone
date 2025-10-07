import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import Hero from '../components/Hero';
import MovieRow from '../components/MovieRow';
import { 
  getTrendingMovies, 
  getFeaturedMovies, 
  getDubbedMovies, 
  getActionMovies, 
  getComedyMovies,
  getDramaMovies,
  getCrimeMovies,
  getSciFiMovies,
  MockMovie 
} from '../data/mockMovies';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [trendingMovies, setTrendingMovies] = useState<MockMovie[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<MockMovie[]>([]);
  const [dubbedMovies, setDubbedMovies] = useState<MockMovie[]>([]);
  const [actionMovies, setActionMovies] = useState<MockMovie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<MockMovie[]>([]);
  const [dramaMovies, setDramaMovies] = useState<MockMovie[]>([]);
  const [crimeMovies, setCrimeMovies] = useState<MockMovie[]>([]);
  const [sciFiMovies, setSciFiMovies] = useState<MockMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load mock movies
      setTrendingMovies(getTrendingMovies());
      setFeaturedMovies(getFeaturedMovies());
      setDubbedMovies(getDubbedMovies());
      setActionMovies(getActionMovies());
      setComedyMovies(getComedyMovies());
      setDramaMovies(getDramaMovies());
      setCrimeMovies(getCrimeMovies());
      setSciFiMovies(getSciFiMovies());
      
    } catch (err: any) {
      console.error('Error loading movies:', err);
      setError('Failed to load movies. Please check your connection.');
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
          backgroundColor: '#141414',
        }}
      >
        <CircularProgress sx={{ color: '#E50914' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#141414', minHeight: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: '#0A0A0A', 
      minHeight: '100vh',
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(229, 9, 20, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(229, 9, 20, 0.05) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(229, 9, 20, 0.05) 0%, transparent 50%)',
    }}>
      {/* Hero Section */}
      <Hero />

      {/* Movie Rows */}
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        {trendingMovies.length > 0 && (
          <MovieRow
            title={language === 'kin' ? 'Filimi zikunze' : 'Trending Now'}
            movies={trendingMovies}
          />
        )}

        {featuredMovies.length > 0 && (
          <MovieRow
            title={language === 'kin' ? 'Filimi nshya' : 'New Releases'}
            movies={featuredMovies}
          />
        )}

        {actionMovies.length > 0 && (
          <MovieRow
            title={language === 'kin' ? 'Filimi z\'ubugabo' : 'Action Movies'}
            movies={actionMovies}
          />
        )}

        {sciFiMovies.length > 0 && (
          <MovieRow
            title={language === 'kin' ? 'Filimi z\'ubwoba' : 'Sci-Fi Movies'}
            movies={sciFiMovies}
          />
        )}

        {dramaMovies.length > 0 && (
          <MovieRow
            title={language === 'kin' ? 'Filimi z\'ubwoba' : 'Drama Movies'}
            movies={dramaMovies}
          />
        )}

        {crimeMovies.length > 0 && (
          <MovieRow
            title={language === 'kin' ? 'Filimi z\'ubwoba' : 'Crime Movies'}
            movies={crimeMovies}
          />
        )}

        {comedyMovies.length > 0 && (
          <MovieRow
            title={language === 'kin' ? 'Filimi z\'ubwoba' : 'Comedy Movies'}
            movies={comedyMovies}
          />
        )}

        {dubbedMovies.length > 0 && (
          <MovieRow
            title={language === 'kin' ? 'Filimi zivugirwa' : 'Dubbed Movies'}
            movies={dubbedMovies}
          />
        )}
      </Container>
    </Box>
  );
};

export default Home;
