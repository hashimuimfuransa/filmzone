// Location detection service for automatic language switching
export interface LocationInfo {
  country: string;
  countryCode: string;
  isRwanda: boolean;
  language: 'en' | 'kin';
}

export class LocationService {
  private static instance: LocationService;
  private locationInfo: LocationInfo | null = null;
  private isDetecting = false;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Detect location using IP geolocation API
  public async detectLocation(): Promise<LocationInfo> {
    if (this.locationInfo) {
      return this.locationInfo;
    }

    if (this.isDetecting) {
      // Wait for ongoing detection
      return new Promise((resolve) => {
        const checkLocation = () => {
          if (this.locationInfo) {
            resolve(this.locationInfo);
          } else {
            setTimeout(checkLocation, 100);
          }
        };
        checkLocation();
      });
    }

    this.isDetecting = true;

    try {
      // Try multiple geolocation APIs for better reliability
      const location = await this.tryMultipleGeolocationAPIs();
      this.locationInfo = location;
      return location;
    } catch (error) {
      console.warn('Failed to detect location, defaulting to English:', error);
      // Default to English if location detection fails
      this.locationInfo = {
        country: 'Unknown',
        countryCode: 'US',
        isRwanda: false,
        language: 'en',
      };
      return this.locationInfo;
    } finally {
      this.isDetecting = false;
    }
  }

  private async tryMultipleGeolocationAPIs(): Promise<LocationInfo> {
    const apis = [
      this.tryIPAPI,
      this.tryIPGeolocation,
      this.tryIPInfo,
    ];

    for (const api of apis) {
      try {
        const result = await api();
        if (result) {
          return result;
        }
      } catch (error) {
        console.warn('Geolocation API failed:', error);
        continue;
      }
    }

    throw new Error('All geolocation APIs failed');
  }

  // Try ipapi.co (free tier: 1000 requests/day)
  private async tryIPAPI(): Promise<LocationInfo | null> {
    const response = await fetch('https://ipapi.co/json/', {
      timeout: 5000,
    } as any);
    
    if (!response.ok) {
      throw new Error('IPAPI request failed');
    }

    const data = await response.json();
    
    if (data.country_code) {
      return {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code,
        isRwanda: data.country_code === 'RW',
        language: data.country_code === 'RW' ? 'kin' : 'en',
      };
    }

    return null;
  }

  // Try ipgeolocation.io (free tier: 1000 requests/month)
  private async tryIPGeolocation(): Promise<LocationInfo | null> {
    const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=free', {
      timeout: 5000,
    } as any);
    
    if (!response.ok) {
      throw new Error('IPGeolocation request failed');
    }

    const data = await response.json();
    
    if (data.country_code2) {
      return {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code2,
        isRwanda: data.country_code2 === 'RW',
        language: data.country_code2 === 'RW' ? 'kin' : 'en',
      };
    }

    return null;
  }

  // Try ipinfo.io (free tier: 50,000 requests/month)
  private async tryIPInfo(): Promise<LocationInfo | null> {
    const response = await fetch('https://ipinfo.io/json', {
      timeout: 5000,
    } as any);
    
    if (!response.ok) {
      throw new Error('IPInfo request failed');
    }

    const data = await response.json();
    
    if (data.country) {
      return {
        country: data.country_name || 'Unknown',
        countryCode: data.country,
        isRwanda: data.country === 'RW',
        language: data.country === 'RW' ? 'kin' : 'en',
      };
    }

    return null;
  }

  // Get cached location info
  public getCachedLocation(): LocationInfo | null {
    return this.locationInfo;
  }

  // Clear cached location (useful for testing)
  public clearCache(): void {
    this.locationInfo = null;
    this.isDetecting = false;
  }

  // Manual location setting (for testing or user override)
  public setLocation(countryCode: string): void {
    this.locationInfo = {
      country: this.getCountryName(countryCode),
      countryCode,
      isRwanda: countryCode === 'RW',
      language: countryCode === 'RW' ? 'kin' : 'en',
    };
  }

  private getCountryName(countryCode: string): string {
    const countryNames: { [key: string]: string } = {
      'RW': 'Rwanda',
      'US': 'United States',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'IT': 'Italy',
      'ES': 'Spain',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'PL': 'Poland',
      'CZ': 'Czech Republic',
      'HU': 'Hungary',
      'RO': 'Romania',
      'BG': 'Bulgaria',
      'HR': 'Croatia',
      'SI': 'Slovenia',
      'SK': 'Slovakia',
      'LT': 'Lithuania',
      'LV': 'Latvia',
      'EE': 'Estonia',
      'IE': 'Ireland',
      'PT': 'Portugal',
      'GR': 'Greece',
      'CY': 'Cyprus',
      'MT': 'Malta',
      'LU': 'Luxembourg',
      'IS': 'Iceland',
      'LI': 'Liechtenstein',
      'MC': 'Monaco',
      'SM': 'San Marino',
      'VA': 'Vatican City',
      'AD': 'Andorra',
    };

    return countryNames[countryCode] || 'Unknown';
  }
}

export default LocationService;
