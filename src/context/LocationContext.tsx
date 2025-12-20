'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Extend the global Window interface to include geolocation error types
declare global {
  interface GeolocationPositionError {
    readonly code: number;
    readonly message: string;
    readonly PERMISSION_DENIED: number;
    readonly POSITION_UNAVAILABLE: number;
    readonly TIMEOUT: number;
  }
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  area?: string;
}

interface LocationContextType {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  detectLocation: () => Promise<void>;
  setLocation: (location: LocationData) => void;
  searchLocation: (address: string) => Promise<void>;
  clearError: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Validate location through API
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If location is outside Delhi, show a user-friendly message and fallback
        if (data.error && data.error.includes('Delhi city limits')) {
          console.log('Location detected but outside Delhi, using Delhi center as fallback');
          // Fallback to Delhi center
          try {
            const fallbackResponse = await fetch('/api/location');
            const fallbackData = await fallbackResponse.json();

            if (fallbackResponse.ok) {
              setLocationState(fallbackData.location);
              setError('Location detected but outside Delhi. Using Delhi center. You can search for a specific Delhi address.');
              return;
            }
          } catch (fallbackErr) {
            console.error('Delhi fallback failed:', fallbackErr);
          }
        }
        throw new Error(data.error || 'Failed to validate location');
      }

      setLocationState(data.location);
    } catch (err) {
      // Handle different types of geolocation errors
      let errorMessage = 'Failed to detect location';

      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions or search for a Delhi address.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please search for a Delhi address.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out. Please search for a Delhi address.';
            break;
          default:
            errorMessage = 'An unknown location error occurred. Please search for a Delhi address.';
        }
      } else if (err instanceof Error) {
        // If it's the Delhi bounds error, provide a more helpful message
        if (err.message.includes('Delhi city limits')) {
          errorMessage = 'Your location appears to be outside Delhi. Please search for a Delhi address or enable location permissions.';
        } else {
          errorMessage = err.message;
        }
      }

      console.error('Location detection error:', errorMessage);

      // Always try fallback to Delhi center for better UX
      try {
        const response = await fetch('/api/location');
        const data = await response.json();

        if (response.ok) {
          setLocationState(data.location);
          // Only show error if fallback also fails
          if (errorMessage.includes('Delhi city limits')) {
            setError('Using Delhi center. Please search for your specific Delhi address.');
          }
          return;
        }
      } catch (fallbackErr) {
        console.error('Fallback location detection failed:', fallbackErr);
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const setLocation = (newLocation: LocationData) => {
    setLocationState(newLocation);
    setError(null);
  };

  const searchLocation = async (address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find location');
      }

      setLocationState(data.location);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search location';
      console.error('Location search error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: LocationContextType = {
    location,
    isLoading,
    error,
    detectLocation,
    setLocation,
    searchLocation,
    clearError,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
