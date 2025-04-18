import { Platform, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Buffer } from 'buffer';

if (!process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || !process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET) {
  throw new Error('Spotify credentials are not configured in environment variables');
}

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    images: { url: string }[];
  };
  external_urls: {
    spotify: string;
  };
  preview_url: string | null;
}

const moodToGenre: Record<string, string[]> = {
  happy: ['pop', 'dance', 'party'],
  sad: ['acoustic', 'piano', 'sad'],
  stressed: ['chill', 'ambient'],
  angry: ['metal', 'punk'],
  relaxed: ['jazz', 'lofi', 'classical'],
};

/**
 * Get Spotify access token using client credentials
 */
async function getSpotifyAccessToken(): Promise<string | null> {
  try {
    const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      console.error('Failed to get Spotify token:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    return null;
  }
}

/**
 * Get song recommendations based on mood
 */
export async function getSpotifyRecommendations(mood: string): Promise<SpotifyTrack[]> {
  try {
    const token = await getSpotifyAccessToken();
    if (!token) {
      throw new Error('Failed to get Spotify access token');
    }

    const genres = moodToGenre[mood.toLowerCase()] || ['pop'];
    const params = new URLSearchParams({
      seed_genres: genres.slice(0, 3).join(','),
      limit: '10',
      market: 'US'
    });

    const response = await fetch(
      `${SPOTIFY_API_URL}/recommendations?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get recommendations');
    }

    const data = await response.json();
    
    return data.tracks.map((track: any): SpotifyTrack => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist: any) => ({ name: artist.name })),
      album: {
        images: track.album.images.map((image: any) => ({ url: image.url }))
      },
      external_urls: {
        spotify: track.external_urls.spotify
      },
      preview_url: track.preview_url
    }));
  } catch (error) {
    console.error('Error getting Spotify recommendations:', error);
    return [];
  }
}

/**
 * Open a Spotify URL in the appropriate app or browser
 */
export async function openSpotifyLink(url: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      const windowObj = globalThis as any;
      windowObj.open(url, '_blank');
    } else {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    }
  } catch (error) {
    console.error('Error opening Spotify link:', error);
    await WebBrowser.openBrowserAsync(url);
  }
} 