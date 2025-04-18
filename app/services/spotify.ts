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

// Spotify genre seeds reference:
// acoustic, afrobeat, alt-rock, alternative, ambient, anime, black-metal,
// bluegrass, blues, bossanova, brazil, breakbeat, british, cantopop, chicago-house,
// children, chill, classical, club, comedy, country, dance, dancehall, death-metal,
// deep-house, detroit-techno, disco, disney, drum-and-bass, dub, dubstep, edm, electro,
// electronic, emo, folk, forro, french, funk, garage, german, gospel, goth, grindcore,
// groove, grunge, guitar, happy, hard-rock, hardcore, hardstyle, heavy-metal, hip-hop,
// holidays, honky-tonk, house, idm, indian, indie, indie-pop, industrial, iranian,
// j-dance, j-idol, j-pop, j-rock, jazz, k-pop, kids, latin, latino, malay, mandopop,
// metal, metal-misc, metalcore, minimal-techno, movies, mpb, new-age, new-release,
// opera, pagode, party, philippines-opm, piano, pop, pop-film, post-dubstep, power-pop,
// progressive-house, psych-rock, punk, punk-rock, r-n-b, rainy-day, reggae, reggaeton,
// road-trip, rock, rock-n-roll, rockabilly, romance, sad, salsa, samba, sertanejo,
// show-tunes, singer-songwriter, ska, sleep, songwriter, soul, soundtracks, spanish,
// study, summer, swedish, synth-pop, tango, techno, trance, trip-hop, turkish,
// work-out, world-music

const moodToGenres: Record<MoodType, { genres: string[]; description: string }> = {
  happy: {
    genres: ['pop', 'dance', 'happy'],
    description: 'Upbeat pop and dance tracks to boost your mood',
  },
  sad: {
    genres: ['sad', 'acoustic', 'rainy-day'],
    description: 'Mellow and emotional tracks for reflection',
  },
  energetic: {
    genres: ['work-out', 'edm', 'power-pop'],
    description: 'High-energy tracks to keep you moving',
  },
  relaxed: {
    genres: ['chill', 'ambient', 'sleep'],
    description: 'Calming melodies to help you unwind',
  },
  focused: {
    genres: ['study', 'classical', 'minimal-techno'],
    description: 'Concentration-enhancing instrumental tracks',
  },
  romantic: {
    genres: ['romance', 'r-n-b', 'soul'],
    description: 'Love songs and romantic melodies',
  },
  angry: {
    genres: ['metal', 'rock', 'alt-rock'],
    description: 'Intense tracks to match your energy',
  },
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

export async function getSpotifyRecommendations(mood: MoodType): Promise<{ tracks: SpotifyTrack[]; description: string }> {
  try {
    const token = await getSpotifyAccessToken();
    const moodMapping = moodToGenres[mood];
    let url = 'https://api.spotify.com/v1/recommendations';
    let description = 'Popular tracks you might enjoy';

    if (moodMapping) {
      const genreString = moodMapping.genres.join(',');
      url += `?seed_genres=${genreString}&limit=10`;
      description = moodMapping.description;
    } else {
      // Fallback to popular genres if no mood mapping found
      url += '?seed_genres=pop,rock,electronic&limit=10';
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch music recommendations');
    }

    const data = await response.json();
    
    return {
      tracks: data.tracks,
      description,
    };
  } catch (error) {
    console.error('Error fetching music recommendations:', error);
    
    // Fallback to top tracks if recommendations fail
    try {
      const token = await getSpotifyAccessToken();
      const fallbackResponse = await fetch(
        'https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?limit=10', // Global Top 50
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!fallbackResponse.ok) {
        throw error;
      }

      const fallbackData = await fallbackResponse.json();
      return {
        tracks: fallbackData.items.map((item: any) => item.track),
        description: 'Popular tracks you might enjoy',
      };
    } catch (fallbackError) {
      console.error('Error fetching fallback tracks:', fallbackError);
      throw error; // Throw original error if fallback also fails
    }
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