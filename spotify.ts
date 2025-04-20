// services/spotify.ts

import React from 'react';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import type { MoodType } from '../types/mood';

const SPOTIFY_CLIENT_ID = Constants.expoConfig?.extra?.spotifyClientId;
const SPOTIFY_CLIENT_SECRET = Constants.expoConfig?.extra?.spotifyClientSecret;
const SPOTIFY_TOKEN_KEY = 'spotify_access_token';
const SPOTIFY_TOKEN_EXPIRY_KEY = 'spotify_token_expiry';
export const DEFAULT_ALBUM_ART = 'https://example.com/default-album-art.jpg';

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  throw new Error('Missing Spotify credentials. Check your app.config.ts and .env files.');
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
  external_urls: { spotify: string };
}

const moodToGenres: Record<MoodType, string> = {
  happy: 'pop',
  sad: 'sad',
  energetic: 'workout',
  relaxed: 'chill',
  focused: 'study',
  romantic: 'love',
  angry: 'rock',
};

async function getAccessToken(): Promise<string> {
  const cachedToken = await SecureStore.getItemAsync(SPOTIFY_TOKEN_KEY);
  const tokenExpiry = await SecureStore.getItemAsync(SPOTIFY_TOKEN_EXPIRY_KEY);

  if (cachedToken && tokenExpiry) {
    const expiryTime = parseInt(tokenExpiry, 10);
    if (expiryTime - Date.now() > 5 * 60 * 1000) {
      return cachedToken;
    }
  }

  const authString = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + authString,
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  await SecureStore.setItemAsync(SPOTIFY_TOKEN_KEY, data.access_token);
  await SecureStore.setItemAsync(SPOTIFY_TOKEN_EXPIRY_KEY, (Date.now() + data.expires_in * 1000).toString());

  return data.access_token;
}

export async function getSpotifyRecommendations(mood: MoodType): Promise<{ tracks: SpotifyTrack[]; description: string }> {
  const genre = moodToGenres[mood];
  if (!genre) {
    return { tracks: [], description: 'No recommendations found for this mood 🎵' };
  }

  try {
    const token = await getAccessToken();

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(genre)}&type=playlist&market=US&limit=5`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const rawText = await searchRes.clone().text();
    console.log('🔍 Raw search response:', rawText);

    const searchData = await searchRes.json();
    console.log('✅ Parsed search data:', searchData);

    const playlist = searchData.playlists?.items?.find((p: any) => p !== null);

    if (!playlist) throw new Error('No playlist found for the genre');

    console.log('🎶 Selected playlist:', {
      name: playlist.name,
      description: playlist.description,
      url: playlist.external_urls?.spotify,
    });

    const tracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=3`, {
      headers: { Authorization: 'Bearer ' + token },
    });

    const tracksData = await tracksRes.json();
    if (!tracksData.items) throw new Error('No track data available');

    const tracks: SpotifyTrack[] = tracksData.items
      .map((item: any) => item.track)
      .filter((track: any) => track?.id)
      .map((track: any) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((a: any) => a.name),
        album: {
          name: track.album?.name ?? 'Unknown Album',
          images: track.album?.images?.length ? track.album.images : [{ url: DEFAULT_ALBUM_ART }],
        },
        preview_url: track.preview_url,
        external_urls: track.external_urls,
      }));
      console.log(tracks)
    return {
      tracks,
      description: `Curated tracks from Spotify playlist "${playlist.name}" for your ${mood} mood 🎵`,
    };
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return {
      tracks: [],
      description: 'Unable to load recommendations at this time 🎵',
    };
  }
}

export async function openSpotifyLink(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch (error) {
    console.error('Error opening Spotify link:', error);
  }
}
