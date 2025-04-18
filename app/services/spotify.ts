import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import type { MoodType } from '../types/mood';

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Missing Spotify credentials in environment variables');
}

interface SpotifyToken {
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

const SPOTIFY_TOKEN_KEY = 'spotify_access_token';
const SPOTIFY_TOKEN_EXPIRY_KEY = 'spotify_token_expiry';

const moodToGenres: Record<MoodType, string[]> = {
  happy: ['pop', 'dance'],
  sad: ['acoustic', 'piano'],
  energetic: ['edm', 'workout'],
  relaxed: ['ambient', 'chill'],
  focused: ['study', 'classical'],
  romantic: ['romance', 'r-n-b'],
  angry: ['metal', 'rock']
};

async function getStoredToken(): Promise<string | null> {
  try {
    const [token, expiryStr] = await Promise.all([
      SecureStore.getItemAsync(SPOTIFY_TOKEN_KEY),
      SecureStore.getItemAsync(SPOTIFY_TOKEN_EXPIRY_KEY),
    ]);

    if (!token || !expiryStr) return null;

    const expiry = parseInt(expiryStr, 10);
    if (Date.now() >= expiry) return null;

    return token;
  } catch (error) {
    console.error('Error reading stored token:', error);
    return null;
  }
}

async function storeToken(token: string, expiresIn: number): Promise<void> {
  try {
    const expiry = Date.now() + expiresIn * 1000;
    await Promise.all([
      SecureStore.setItemAsync(SPOTIFY_TOKEN_KEY, token),
      SecureStore.setItemAsync(SPOTIFY_TOKEN_EXPIRY_KEY, expiry.toString()),
    ]);
  } catch (error) {
    console.error('Error storing token:', error);
  }
}

export async function getSpotifyAccessToken(): Promise<string> {
  const storedToken = await getStoredToken();
  if (storedToken) return storedToken;

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
    await storeToken(data.access_token, data.expires_in);
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
}

export async function getSpotifyRecommendations(mood: MoodType): Promise<SpotifyTrack[]> {
  try {
    const token = await getSpotifyAccessToken();
    const genres = moodToGenres[mood];
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
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      await WebBrowser.openBrowserAsync(url);
    }
  } catch (error) {
    console.error('Error opening Spotify link:', error);
    throw error;
  }
} 