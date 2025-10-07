import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import LocationService from '../services/locationService';

const LocationTestPanel: React.FC = () => {
  const { 
    locationInfo, 
    isLocationDetecting, 
    language, 
    manualLanguageOverride,
    setLanguage 
  } = useLanguage();

  const handleRefreshLocation = async () => {
    const locationService = LocationService.getInstance();
    locationService.clearCache();
    window.location.reload(); // Simple refresh to retrigger detection
  };

  const handleTestRwanda = () => {
    const locationService = LocationService.getInstance();
    locationService.setLocation('RW');
    setLanguage('kin');
  };

  const handleTestUSA = () => {
    const locationService = LocationService.getInstance();
    locationService.setLocation('US');
    setLanguage('en');
  };

  const handleResetOverride = () => {
    localStorage.removeItem('manualLanguageOverride');
    localStorage.removeItem('language');
    window.location.reload();
  };

  return (
    <Card sx={{ 
      backgroundColor: 'rgba(26, 26, 26, 0.9)', 
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(229, 9, 20, 0.2)',
      borderRadius: '12px',
      p: 2,
      mb: 2,
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: '#E50914', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon />
          Location Detection Test Panel
        </Typography>

        <Stack spacing={2}>
          {/* Current Status */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#B3B3B3', mb: 1 }}>
              Current Status:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`Language: ${language === 'kin' ? 'Kinyarwanda' : 'English'}`}
                size="small"
                color={language === 'kin' ? 'primary' : 'default'}
                sx={{ backgroundColor: language === 'kin' ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255, 255, 255, 0.1)' }}
              />
              <Chip
                label={`Manual Override: ${manualLanguageOverride ? 'Yes' : 'No'}`}
                size="small"
                color={manualLanguageOverride ? 'warning' : 'default'}
              />
              <Chip
                label={`Detecting: ${isLocationDetecting ? 'Yes' : 'No'}`}
                size="small"
                color={isLocationDetecting ? 'info' : 'default'}
              />
            </Stack>
          </Box>

          {/* Location Info */}
          {locationInfo && (
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#B3B3B3', mb: 1 }}>
                Detected Location:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  icon={<LocationIcon />}
                  label={`${locationInfo.country} (${locationInfo.countryCode})`}
                  size="small"
                  sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Chip
                  label={`Is Rwanda: ${locationInfo.isRwanda ? 'Yes' : 'No'}`}
                  size="small"
                  color={locationInfo.isRwanda ? 'primary' : 'default'}
                />
              </Stack>
            </Box>
          )}

          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Test Controls */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#B3B3B3', mb: 1 }}>
              Test Controls:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRefreshLocation}
                sx={{
                  borderColor: 'rgba(229, 9, 20, 0.5)',
                  color: '#E50914',
                  '&:hover': {
                    borderColor: '#E50914',
                    backgroundColor: 'rgba(229, 9, 20, 0.1)',
                  },
                }}
              >
                Refresh Location
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleTestRwanda}
                sx={{
                  borderColor: 'rgba(229, 9, 20, 0.5)',
                  color: '#E50914',
                  '&:hover': {
                    borderColor: '#E50914',
                    backgroundColor: 'rgba(229, 9, 20, 0.1)',
                  },
                }}
              >
                Test Rwanda
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleTestUSA}
                sx={{
                  borderColor: 'rgba(229, 9, 20, 0.5)',
                  color: '#E50914',
                  '&:hover': {
                    borderColor: '#E50914',
                    backgroundColor: 'rgba(229, 9, 20, 0.1)',
                  },
                }}
              >
                Test USA
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleResetOverride}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#B3B3B3',
                  '&:hover': {
                    borderColor: '#E50914',
                    backgroundColor: 'rgba(229, 9, 20, 0.1)',
                  },
                }}
              >
                Reset Override
              </Button>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LocationTestPanel;
