'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { cn } from '@/utils';

interface LocationInputProps {
  className?: string;
  variant?: 'hero' | 'compact';
}

export function LocationInput({ className, variant = 'hero' }: LocationInputProps) {
  const { location, isLoading, error, detectLocation, searchLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    await searchLocation(searchQuery);
    setIsSearching(false);
  };

  const handleDetectLocation = async () => {
    await detectLocation();
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
        <span className="text-sm text-gray-700 truncate">
          {location?.area || 'Select Location'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDetectLocation}
          disabled={isLoading}
          className="h-8 px-2"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Navigation className="h-3 w-3" />
          )}
        </Button>
      </div>
    );
  }

  // Hero variant (default)
  return (
    <div className={cn('w-full max-w-md space-y-4', className)}>
      {/* Current Location Display */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-orange-500" />
            <div>
              <p className="font-medium text-gray-900">
                {location?.area || 'Delhi'}
              </p>
              <p className="text-sm text-gray-500 truncate max-w-[200px]">
                {location?.address || 'Select your delivery location'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleDetectLocation}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Detect
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Search Location */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Enter delivery address in Delhi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-0 focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {location && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-600">
            ✓ Location set to {location.area}, Delhi
          </p>
        </div>
      )}
    </div>
  );
}



















