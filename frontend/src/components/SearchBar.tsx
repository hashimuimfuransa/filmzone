import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Autocomplete,
  Chip,
  Typography,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../hooks/useCustomHooks';
import { moviesAPI, dubbersAPI } from '../services/api';

interface SearchResult {
  id: string;
  title: string;
  type: 'movie' | 'dubber';
  subtitle?: string;
}

const SearchBar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  React.useEffect(() => {
    if (debouncedSearchQuery.trim().length > 2) {
      performSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  const performSearch = async (query: string) => {
    try {
      setLoading(true);

      const [moviesResponse, dubbersResponse] = await Promise.all([
        moviesAPI.getMovies({ q: query, limit: 5 }),
        dubbersAPI.getDubbers(),
      ]);

      const movies = moviesResponse.data.movies.map((movie: any) => ({
        id: movie._id,
        title: movie.titleEn,
        type: 'movie' as const,
        subtitle: `${movie.year} • ${movie.durationMinutes}min`,
      }));

      const dubbers = dubbersResponse.data.dubbers
        .filter((dubber: any) =>
          dubber.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
        .map((dubber: any) => ({
          id: dubber._id,
          title: dubber.name,
          type: 'dubber' as const,
          subtitle: 'Voice Actor',
        }));

      setSearchResults([...movies, ...dubbers]);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?q=${encodeURIComponent(searchQuery.trim())}`);
      setOpen(false);
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    if (result.type === 'movie') {
      navigate(`/movies/${result.id}`);
    } else if (result.type === 'dubber') {
      navigate(`/dubbers/${result.id}`);
    }
    setOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <Box component="form" onSubmit={handleSearch} sx={{ width: '100%' }}>
      <Autocomplete
        freeSolo
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        options={searchResults}
        getOptionLabel={option =>
          typeof option === 'string' ? option : option.title
        }
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            onClick={() => handleResultSelect(option)}
            sx={{ cursor: 'pointer' }}
          >
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {option.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {option.subtitle}
              </Typography>
              <Chip
                label={option.type}
                size="small"
                color={option.type === 'movie' ? 'primary' : 'secondary'}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
        )}
        renderInput={params => (
          <TextField
            {...params}
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searchQuery && (
                    <IconButton onClick={handleClear} size="small">
                      <ClearIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255,255,255,0.7)',
              },
            }}
          />
        )}
        loading={loading}
        noOptionsText="No results found"
      />
    </Box>
  );
};

export default SearchBar;
