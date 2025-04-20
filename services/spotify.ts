import React from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import type { MoodType } from '../types/mood';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const SPOTIFY_CLIENT_ID = Constants.expoConfig?.extra?.spotifyClientId;
const SPOTIFY_CLIENT_SECRET = Constants.expoConfig?.extra?.spotifyClientSecret;
const SPOTIFY_TOKEN_KEY = 'spotify_access_token';
const SPOTIFY_TOKEN_EXPIRY_KEY = 'spotify_token_expiry';
const SPOTIFY_CATEGORIES_CACHE_KEY = 'spotify_categories';
const SPOTIFY_CATEGORIES_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Default album art if none is provided
const DEFAULT_ALBUM_ART = 'https://example.com/default-album-art.jpg';

// Enhanced credential validation
console.log('\n=== Spotify Credentials Check ===');
console.log('Client ID:', {
  exists: !!SPOTIFY_CLIENT_ID,
  length: SPOTIFY_CLIENT_ID?.length,
  preview: SPOTIFY_CLIENT_ID?.substring(0, 6),
  source: 'Constants.expoConfig.extra.spotifyClientId'
});
console.log('Client Secret:', {
  exists: !!SPOTIFY_CLIENT_SECRET,
  length: SPOTIFY_CLIENT_SECRET?.length,
  preview: SPOTIFY_CLIENT_SECRET?.substring(0, 6),
  source: 'Constants.expoConfig.extra.spotifyClientSecret'
});
console.log('=== End Credentials Check ===\n');

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error('Missing Spotify credentials:', {
    hasClientId: !!SPOTIFY_CLIENT_ID,
    hasClientSecret: !!SPOTIFY_CLIENT_SECRET,
  });
  throw new Error('Missing Spotify credentials. Check your app.config.ts and .env files.');
}

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: {
    name: string;
    images: { url: string }[];
  };
  preview_url: string | null;
}

// Map moods to Spotify category IDs using slugs
const moodCategoryMap: Record<MoodType, { categoryId: string; description: string }> = {
  happy: {
    categoryId: '0JQ5DAqbMKFEC4WFtoNRpw', // Pop
    description: 'Upbeat and energetic tracks to boost your mood 🎵',
  },
  sad: {
    categoryId: '0JQ5DAqbMKFz6FAsUtgAab', // New Releases (closest available)
    description: 'Mellow and emotional tracks for reflection 🎵',
  },
  energetic: {
    categoryId: '0JQ5DAqbMKFQ00XGBls6ym', // Hip-Hop
    description: 'High-energy tracks to keep you moving 🎵',
  },
  relaxed: {
    categoryId: '0JQ5DAqbMKFMwSxVe96hyA', // Musik Indonesia
    description: 'Calming melodies to help you unwind 🎵',
  },
  focused: {
    categoryId: '0JQ5DAqbMKFGnsSfvg90Wo', // GLOW
    description: 'Concentration-enhancing instrumental tracks 🎵',
  },
  romantic: {
    categoryId: '0JQ5DAqbMKFEC4WFtoNRpw', // Pop (used again)
    description: 'Love songs and romantic melodies 🎵',
  },
  angry: {
    categoryId: '0JQ5DAqbMKFDXXwE9BDJAr', // Rock
    description: 'Intense tracks to channel your energy 🎵',
  },
};

/**
 * Get an access token for the Spotify API using client credentials
 */
async function getAccessToken(): Promise<string> {
  try {
    console.log('\n=== Spotify Token Retrieval ===');
    
    // Check if we have a cached token
    const cachedToken = await SecureStore.getItemAsync(SPOTIFY_TOKEN_KEY);
    const tokenExpiry = await SecureStore.getItemAsync(SPOTIFY_TOKEN_EXPIRY_KEY);

    if (cachedToken && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry, 10);
      const timeToExpiry = expiryTime - Date.now();
      const minutesToExpiry = Math.round(timeToExpiry / (60 * 1000));
      
      console.log('Found cached token:', {
        exists: true,
        preview: cachedToken.substring(0, 10) + '...',
        expiresIn: minutesToExpiry + ' minutes',
        isValid: timeToExpiry > 5 * 60 * 1000 // 5-minute buffer
      });

      // Add 5-minute buffer before expiry
      if (timeToExpiry > 5 * 60 * 1000) {
        console.log('Using cached token (valid for', minutesToExpiry, 'minutes)');
        console.log('=== End Token Retrieval ===\n');
        return cachedToken;
      } else {
        console.log('Cached token expired or expiring soon, fetching new token');
      }
    } else {
      console.log('No cached token found, fetching new token');
    }

    console.log('Initiating token request...');
    const authString = Buffer.from(
      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');
    
    console.log('Auth string preview:', authString.substring(0, 10) + '...');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + authString,
      },
      body: 'grant_type=client_credentials',
    });

    console.log('Token response status:', response.status);
    const data: SpotifyToken = await response.json();

    if (!response.ok || !data.access_token) {
      console.error('Token request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        errorDescription: data.error_description
      });
      throw new Error(`Failed to get access token: ${response.status}`);
    }

    // Cache the token
    await SecureStore.setItemAsync(SPOTIFY_TOKEN_KEY, data.access_token);
    await SecureStore.setItemAsync(
      SPOTIFY_TOKEN_EXPIRY_KEY,
      (Date.now() + data.expires_in * 1000).toString()
    );

    console.log('Successfully obtained new token:', {
      preview: data.access_token.substring(0, 10) + '...',
      expiresIn: data.expires_in + ' seconds',
      tokenType: data.token_type
    });
    
    console.log('=== End Token Retrieval ===\n');
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify access token:', {
      error,
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Clear invalid token from cache
    await SecureStore.deleteItemAsync(SPOTIFY_TOKEN_KEY);
    await SecureStore.deleteItemAsync(SPOTIFY_TOKEN_EXPIRY_KEY);
    
    throw error;
  }
}

/**
 * Debug function to verify Spotify authentication flow
 */
async function debugSpotifyAuthFlow(): Promise<void> {
  try {
    console.log('\n=== Starting Spotify Auth Flow Debug ===');
    
    // Step 1: Get access token
    console.log('\nStep 1: Getting access token...');
    const token = await getAccessToken();
    console.log('Token obtained successfully');
    
    // Step 2: Test token with categories endpoint
    console.log('\nStep 2: Testing token with categories endpoint...');
    const categoriesRes = await fetch('https://api.spotify.com/v1/browse/categories?locale=en_US', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    console.log('Categories API response:', {
      status: categoriesRes.status,
      ok: categoriesRes.ok,
      statusText: categoriesRes.statusText
    });

    if (!categoriesRes.ok) {
      const errorData = await categoriesRes.json();
      console.error('Categories request failed:', {
        status: categoriesRes.status,
        error: errorData
      });
      
      if (categoriesRes.status === 401) {
        console.log('Token appears to be invalid, clearing from cache');
        await SecureStore.deleteItemAsync(SPOTIFY_TOKEN_KEY);
        await SecureStore.deleteItemAsync(SPOTIFY_TOKEN_EXPIRY_KEY);
      }
      
      throw new Error(`Categories request failed: ${categoriesRes.status}`);
    }

    const categoriesData = await categoriesRes.json();
    console.log('Categories data preview:', {
      total: categoriesData.categories?.total,
      sampleCategories: categoriesData.categories?.items?.slice(0, 3).map((cat: any) => ({
        id: cat.id,
        name: cat.name
      }))
    });

    console.log('\nAuth flow verification complete!');
    console.log('✅ Token retrieval successful');
    console.log('✅ Token cache working');
    console.log('✅ API calls successful');
    console.log('\n=== End Spotify Auth Flow Debug ===\n');
  } catch (error) {
    console.error('\n❌ Auth flow verification failed:', {
      error,
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log('\n=== End Spotify Auth Flow Debug (with errors) ===\n');
    throw error;
  }
}

/**
 * Get available Spotify categories
 */
async function getSpotifyCategories(token: string): Promise<Record<string, string>> {
  try {
    // Check cache first
    const cachedData = await SecureStore.getItemAsync(SPOTIFY_CATEGORIES_CACHE_KEY);
    if (cachedData) {
      const { categories, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < SPOTIFY_CATEGORIES_EXPIRY) {
        console.log('Using cached Spotify categories');
        return categories;
      }
    }

    console.log('Fetching Spotify categories...');
    const response = await fetch('https://api.spotify.com/v1/browse/categories?locale=en_US', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const data = await response.json();
    const categories = data.categories.items.reduce((acc: Record<string, string>, cat: any) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {});

    // Cache categories
    await SecureStore.setItemAsync(SPOTIFY_CATEGORIES_CACHE_KEY, JSON.stringify({
      categories,
      timestamp: Date.now()
    }));

    return categories;
  } catch (error) {
    console.error('Error fetching Spotify categories:', error);
    throw error;
  }
}

/**
 * Get playlist tracks for a specific category
 */
async function getCategoryPlaylistTracks(token: string, categoryId: string): Promise<SpotifyTrack[]> {
  try {
    console.log('\n=== Fetching Category Playlist Tracks ===');
    console.log('Request details:', { categoryId });

    // 1. Get playlists for category
    const playlistRes = await fetch(`https://api.spotify.com/v1/browse/categories/${categoryId}/playlists`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!playlistRes.ok) {
      console.error('Failed to fetch category playlists:', {
        status: playlistRes.status,
        statusText: playlistRes.statusText,
        categoryId
      });
      return [];
    }

    const playlistData = await playlistRes.json();
    const playlist = playlistData?.playlists?.items?.[0];

    if (!playlist?.tracks?.href) {
      console.warn('No playlists found for category:', categoryId);
      return [];
    }

    // 2. Get tracks from first playlist
    const tracksRes = await fetch(`${playlist.tracks.href}?limit=20`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!tracksRes.ok) {
      console.error('Failed to fetch playlist tracks:', {
        status: tracksRes.status,
        statusText: tracksRes.statusText,
        playlistId: playlist.id
      });
      return [];
    }

    const tracksData = await tracksRes.json();

    // Track processing statistics
    let totalTracks = tracksData.items?.length || 0;
    let tracksWithDefaultArt = 0;
    let tracksWithUnknownAlbum = 0;

    const validTracks = (tracksData.items || [])
      .map((item: any) => item.track)
      .filter((track: any): track is NonNullable<typeof track> => 
        track?.id && track?.name && track?.artists?.length)
      .map((track: any) => {
        // Handle missing album data
        const albumName = track.album?.name ?? 'Unknown Album';
        if (!track.album?.name) {
          tracksWithUnknownAlbum++;
        }

        // Handle missing album art
        let albumImages = track.album?.images;
        if (!albumImages?.length) {
          tracksWithDefaultArt++;
          albumImages = [{ url: DEFAULT_ALBUM_ART }];
        }

        return {
          id: track.id,
          name: track.name,
          artists: track.artists.map((a: any) => a.name),
          album: {
            name: albumName,
            images: albumImages,
          },
          preview_url: track.preview_url,
        };
      });

    // Log processing results
    console.log('Track processing results:', {
      categoryId,
      playlist: playlist.name,
      totalReceived: totalTracks,
      validTracks: validTracks.length,
      skippedTracks: totalTracks - validTracks.length,
      tracksWithDefaultArt,
      tracksWithUnknownAlbum,
      sampleTrack: validTracks[0] ? {
        name: validTracks[0].name,
        artists: validTracks[0].artists,
        hasPreview: !!validTracks[0].preview_url
      } : 'No valid tracks'
    });

    console.log('=== End Category Playlist Fetch ===\n');

    return validTracks;
  } catch (error) {
    console.error('Error getting category playlist tracks:', {
      error,
      categoryId,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    return [];
  }
}

/**
 * Get Spotify recommendations for a specific mood using category-based playlists
 */
async function getSpotifyRecommendations(mood: MoodType): Promise<{ tracks: SpotifyTrack[]; description: string }> {
  console.log('Fetching recommendations for mood:', mood);
  
  const config = moodCategoryMap[mood];
  if (!config) {
    console.error('Invalid mood configuration:', mood);
    return { tracks: [], description: 'No recommendations found for this mood 🎵' };
  }

  try {
    const token = await getAccessToken();
    
    // Verify category exists
    const categories = await getSpotifyCategories(token);
    if (!categories[config.categoryId]) {
      console.error('Invalid category ID:', config.categoryId);
      return { tracks: [], description: 'Unable to find music for this mood 🎵' };
    }

    const tracks = await getCategoryPlaylistTracks(token, config.categoryId);
    
    if (!tracks.length) {
      console.warn('No tracks found for mood:', mood);
      return {
        tracks: [],
        description: 'No music found for this mood 🎵',
      };
    }

    return {
      tracks,
      description: config.description,
    };
  } catch (error) {
    console.error('Error getting recommendations:', {
      error,
      mood,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    return {
      tracks: [],
      description: 'Unable to load recommendations at this time 🎵',
    };
  }
}

/**
 * Open a Spotify link in the browser
 */
async function openSpotifyLink(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch (error) {
    console.error('Error opening Spotify link:', error);
  }
}

/**
 * Debug function to verify Spotify categories
 */
async function debugSpotifyCategories() {
  try {
    console.log('\n=== Verifying Spotify Categories ===');
    const token = await getAccessToken();
    
    // Fetch raw categories data first
    console.log('\nFetching raw categories data...');
    const response = await fetch('https://api.spotify.com/v1/browse/categories?locale=en_US', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const rawData = await response.json();
    console.log('\nRaw Spotify Categories:');
    rawData.categories.items.forEach((category: any) => {
      console.log(`${category.id}: ${category.name}`);
    });

    // Current mood mappings
    console.log('\nCurrent mood-to-category mappings:');
    Object.entries(moodCategoryMap).forEach(([mood, config]) => {
      const matchingCategory = rawData.categories.items.find((cat: any) => cat.id === config.categoryId);
      console.log(`${mood}: ${config.categoryId} (${matchingCategory ? '✅ valid' : '❌ invalid'})`);
      if (!matchingCategory) {
        console.log('  Suggested fix: Use one of the valid category IDs shown above');
      }
    });
    
    console.log('\n=== End Category Verification ===');
    return { categories: rawData.categories.items };
  } catch (error) {
    console.error('Error verifying categories:', error);
    throw error;
  }
}

// Export all functions and constants
export {
  DEFAULT_ALBUM_ART,
  debugSpotifyAuthFlow,
  debugSpotifyCategories,
  getSpotifyRecommendations,
  openSpotifyLink
}; 