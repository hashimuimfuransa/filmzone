import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';

const LocationIndicator: React.FC = () => {
  const { 
    locationInfo, 
    isLocationDetecting, 
    language, 
    manualLanguageOverride 
  } = useLanguage();

  if (isLocationDetecting) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} sx={{ color: '#E50914' }} />
        <Typography variant="caption" sx={{ color: '#B3B3B3' }}>
          Detecting location...
        </Typography>
      </Box>
    );
  }

  if (!locationInfo) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip 
        title={
          manualLanguageOverride 
            ? `Language manually set to ${language === 'kin' ? 'Kinyarwanda' : 'English'}`
            : `Auto-detected: ${locationInfo.country} (${locationInfo.countryCode})`
        }
        arrow
      >
        <Chip
          icon={manualLanguageOverride ? <LanguageIcon /> : <LocationIcon />}
          label={
            manualLanguageOverride 
              ? `${language === 'kin' ? 'Kinyarwanda' : 'English'} (Manual)`
              : `${locationInfo.country} - ${language === 'kin' ? 'Kinyarwanda' : 'English'}`
          }
          size="small"
          sx={{
            backgroundColor: 'rgba(229, 9, 20, 0.1)',
            color: '#E50914',
            border: '1px solid rgba(229, 9, 20, 0.3)',
            fontSize: '0.7rem',
            height: 24,
            '& .MuiChip-icon': {
              fontSize: '0.8rem',
            },
            '&:hover': {
              backgroundColor: 'rgba(229, 9, 20, 0.2)',
            },
          }}
        />
      </Tooltip>
    </Box>
  );
};

export default LocationIndicator;
