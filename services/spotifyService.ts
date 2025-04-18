import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Buffer } from 'buffer';

const CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_SPOTIFY_CLIENT_SECRET';

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    images: Array<{ url: string }>;
  };
  external_urls: {
    spotify: string;
  };
}

const moodToGenres: Record<string, string[]> = {
  happy: ['pop', 'dance', 'happy'],
  sad: ['sad', 'acoustic', 'piano'],
  energetic: ['edm', 'rock', 'workout'],
  relaxed: ['chill', 'ambient', 'sleep'],
  focused: ['focus', 'classical', 'study'],
};

async function getSpotifyToken(): Promise<string> {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
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

export async function getMusicRecommendations(mood: string): Promise<Array<{
  title: string;
  artist: string;
  imageUrl: string;
  spotifyUrl: string;
}>> {
  try {
    const token = await getSpotifyToken();
    const genres = moodToGenres[mood.toLowerCase()] || ['pop'];
    const seed_genres = genres.join(',');

    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?limit=10&seed_genres=${seed_genres}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get music recommendations');
    }

    const data = await response.json();
    return data.tracks.map((track: SpotifyTrack) => ({
      title: track.name,
      artist: track.artists[0].name,
      imageUrl: track.album.images[0]?.url || '',
      spotifyUrl: track.external_urls.spotify,
    }));
  } catch (error) {
    console.error('Error getting music recommendations:', error);
    throw error;
  }
}

export async function openSpotifyLink(url: string) {
  try {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(url);
    }
  } catch (error) {
    console.error('Error opening Spotify link:', error);
    throw error;
  }
} 