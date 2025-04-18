import * as WebBrowser from 'expo-web-browser';
import { Platform, Linking } from 'react-native';

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Spotify credentials not found in environment variables');
}

export interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  external_urls: {
    spotify: string;
  };
  preview_url: string | null;
}

const moodToGenres: Record<string, string[]> = {
  happy: ['pop', 'dance'],
  sad: ['acoustic', 'piano'],
  energetic: ['edm', 'rock'],
  calm: ['ambient', 'classical'],
  anxious: ['indie', 'alternative'],
  romantic: ['r-n-b', 'jazz'],
};

async function getSpotifyToken(): Promise<string> {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error('Failed to get Spotify token');
    }

    const data: SpotifyToken = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
}

export async function getSpotifyRecommendations(mood: string): Promise<SpotifyTrack[]> {
  try {
    const token = await getSpotifyToken();
    const genres = moodToGenres[mood.toLowerCase()] || ['pop', 'rock'];
    const genreString = genres.join(',');

    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?seed_genres=${genreString}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch music recommendations');
    }

    const data = await response.json();
    return data.tracks;
  } catch (error) {
    console.error('Error fetching music recommendations:', error);
    throw error;
  }
}

export async function openSpotifyLink(url: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await WebBrowser.openBrowserAsync(url);
    } else {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    }
  } catch (error) {
    console.error('Error opening Spotify link:', error);
    throw error;
  }
} 