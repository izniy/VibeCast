import { MoodType } from './mood';

if (!process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || !process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET) {
  throw new Error('Spotify credentials are not configured in environment variables');
}

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
  previewUrl: string | null;
}

export interface SpotifyError {
  message: string;
  status: number;
}

export type SpotifyResponse<T> = {
  data: T | null;
  error: SpotifyError | null;
};

const moodToGenre: Record<MoodType, string[]> = {
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
export async function getSpotifyRecommendations(
  mood: MoodType
): Promise<SpotifyResponse<Song[]>> {
  try {
    const token = await getSpotifyAccessToken();
    if (!token) {
      return {
        data: null,
        error: {
          message: 'Failed to get Spotify access token',
          status: 401
        }
      };
    }

    const genres = moodToGenre[mood];
    const params = new URLSearchParams({
      seed_genres: genres.slice(0, 3).join(','), // Spotify allows max 5 seed values
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
      return {
        data: null,
        error: {
          message: 'Failed to get recommendations',
          status: response.status
        }
      };
    }

    const data = await response.json();
    
    const songs: Song[] = data.tracks.map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      imageUrl: track.album.images[0]?.url || '',
      previewUrl: track.preview_url
    }));

    return {
      data: songs,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500
      }
    };
  }
} 