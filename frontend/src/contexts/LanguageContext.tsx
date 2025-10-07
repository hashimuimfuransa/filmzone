import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LocationService, { LocationInfo } from '../services/locationService';

interface LanguageContextType {
  language: 'en' | 'kin';
  setLanguage: (lang: 'en' | 'kin') => void;
  isRwanda: boolean;
  defaultTab: 'dubbed' | 'all';
  locationInfo: LocationInfo | null;
  isLocationDetecting: boolean;
  manualLanguageOverride: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<'en' | 'kin'>('en');
  const [isRwanda, setIsRwanda] = useState(false);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isLocationDetecting, setIsLocationDetecting] = useState(true);
  const [manualLanguageOverride, setManualLanguageOverride] = useState(false);

  // Detect user location and set language accordingly
  useEffect(() => {
    const detectLocationAndSetLanguage = async () => {
      setIsLocationDetecting(true);
      
      try {
        // Check if user has manually set a language preference
        const savedLanguage = localStorage.getItem('language') as 'en' | 'kin';
        const hasManualOverride = localStorage.getItem('manualLanguageOverride') === 'true';
        
        if (hasManualOverride && savedLanguage) {
          // User has manually set language, respect their choice
          setLanguageState(savedLanguage);
          i18n.changeLanguage(savedLanguage);
          setIsRwanda(savedLanguage === 'kin');
          setManualLanguageOverride(true);
          setIsLocationDetecting(false);
          return;
        }

        // Detect location using IP geolocation
        const locationService = LocationService.getInstance();
        const location = await locationService.detectLocation();
        
        setLocationInfo(location);
        setIsRwanda(location.isRwanda);
        
        // Set language based on location
        const detectedLanguage = location.language;
        setLanguageState(detectedLanguage);
        i18n.changeLanguage(detectedLanguage);
        
        // Save the detected language as default
        localStorage.setItem('language', detectedLanguage);
        localStorage.setItem('detectedCountry', location.countryCode);
        
        console.log(`🌍 Location detected: ${location.country} (${location.countryCode}) - Language set to: ${detectedLanguage}`);
        
      } catch (error) {
        console.error('Error detecting location:', error);
        
        // Fallback to saved language or default to English
        const savedLanguage = localStorage.getItem('language') as 'en' | 'kin';
        const fallbackLanguage = savedLanguage || 'en';
        
        setLanguageState(fallbackLanguage);
        i18n.changeLanguage(fallbackLanguage);
        setIsRwanda(fallbackLanguage === 'kin');
        
        // Set fallback location info
        setLocationInfo({
          country: 'Unknown',
          countryCode: 'US',
          isRwanda: false,
          language: 'en',
        });
      } finally {
        setIsLocationDetecting(false);
      }
    };

    detectLocationAndSetLanguage();
  }, [i18n]);

  const setLanguage = (lang: 'en' | 'kin') => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    localStorage.setItem('manualLanguageOverride', 'true');
    setManualLanguageOverride(true);
    
    // Update isRwanda based on manual language selection
    setIsRwanda(lang === 'kin');
    
    console.log(`🌐 Language manually changed to: ${lang}`);
  };

  const defaultTab = isRwanda ? 'dubbed' : 'all';

  const value: LanguageContextType = {
    language,
    setLanguage,
    isRwanda,
    defaultTab,
    locationInfo,
    isLocationDetecting,
    manualLanguageOverride,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
