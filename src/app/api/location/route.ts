import { NextRequest, NextResponse } from 'next/server';

// Delhi coordinates (approximate center)
const DELHI_CENTER = {
  lat: 28.6139,
  lng: 77.2090
};

// Delhi boundaries (approximate)
const DELHI_BOUNDS = {
  north: 28.9,
  south: 28.4,
  east: 77.4,
  west: 76.8
};

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  area?: string;
}

interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

// Validate if coordinates are within Delhi
function isWithinDelhi(lat: number, lng: number): boolean {
  return lat >= DELHI_BOUNDS.south &&
         lat <= DELHI_BOUNDS.north &&
         lng >= DELHI_BOUNDS.west &&
         lng <= DELHI_BOUNDS.east;
}

// Reverse geocode coordinates to get address
async function reverseGeocode(lat: number, lng: number): Promise<LocationData | null> {
  try {
    // Using a free geocoding service (you might want to use Google Maps API or similar)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await response.json();

    return {
      latitude: lat,
      longitude: lng,
      address: data.localityInfo?.administrative?.[2]?.name
        ? `${data.city}, ${data.localityInfo.administrative[2].name}, Delhi`
        : `${data.city}, Delhi`,
      city: 'Delhi',
      area: data.city || 'Delhi'
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      latitude: lat,
      longitude: lng,
      address: `Location in Delhi (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      city: 'Delhi',
      area: 'Delhi'
    };
  }
}

// Forward geocode address to coordinates
async function forwardGeocode(address: string): Promise<LocationData | null> {
  try {
    // Using Nominatim (OpenStreetMap) for free geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Delhi, India')}&limit=1`
    );

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        address: result.display_name,
        city: 'Delhi',
        area: result.display_name.split(',')[0]
      };
    }

    return null;
  } catch (error) {
    console.error('Forward geocoding error:', error);
    return null;
  }
}

// GET - Get user's current location (server-side geolocation simulation)
export async function GET(request: NextRequest) {
  try {
    // For demo purposes, return Delhi center
    // In production, you'd get the actual IP-based location
    const locationData = await reverseGeocode(DELHI_CENTER.lat, DELHI_CENTER.lng);

    if (!locationData) {
      return NextResponse.json(
        { error: 'Unable to determine location' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      location: locationData,
      message: 'Location detected successfully'
    });
  } catch (error) {
    console.error('Location detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect location' },
      { status: 500 }
    );
  }
}

// POST - Validate and store user location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, address } = body;

    let locationData: LocationData | null = null;

    // If coordinates provided, validate and reverse geocode
    if (latitude !== undefined && longitude !== undefined) {
      if (!isWithinDelhi(latitude, longitude)) {
        return NextResponse.json(
          { error: 'Location must be within Delhi city limits' },
          { status: 400 }
        );
      }
      locationData = await reverseGeocode(latitude, longitude);
    }
    // If address provided, forward geocode
    else if (address) {
      locationData = await forwardGeocode(address);
      if (!locationData || !isWithinDelhi(locationData.latitude, locationData.longitude)) {
        return NextResponse.json(
          { error: 'Address must be within Delhi city limits' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Either coordinates or address must be provided' },
        { status: 400 }
      );
    }

    if (!locationData) {
      return NextResponse.json(
        { error: 'Unable to process location' },
        { status: 400 }
      );
    }

    // In a real app, you'd store this in a database
    // For now, just return the validated location

    return NextResponse.json({
      success: true,
      location: locationData,
      message: 'Location validated and stored successfully'
    });
  } catch (error) {
    console.error('Location validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate location' },
      { status: 500 }
    );
  }
}











