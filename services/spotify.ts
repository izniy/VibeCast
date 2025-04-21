// services/spotify.ts

import React from 'react';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { MoodType } from '@/types/mood';

const SPOTIFY_CLIENT_ID = Constants.expoConfig?.extra?.spotifyClientId;
const SPOTIFY_CLIENT_SECRET = Constants.expoConfig?.extra?.spotifyClientSecret;
const SPOTIFY_TOKEN_KEY = 'spotify_access_token';
const SPOTIFY_TOKEN_EXPIRY_KEY = 'spotify_token_expiry';
export const DEFAULT_ALBUM_ART = 'https://example.com/default-album-art.jpg';

const sessionPlaylistIndex: Record<MoodType, number> = {
  happy: 0,
  sad: 0,
  energetic: 0,
  relaxed: 0,
  focused: 0,
  romantic: 0,
  angry: 0,
};

const MAX_PLAYLISTS = 10;

interface SpotifyPlaylist {
  id: string;
  name: string;
  tracks: {
    total: number;
  };
  owner: {
    display_name: string;
  };
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

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  throw new Error('Missing Spotify credentials. Check your app.config.ts and .env files.');
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

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

export async function getSpotifyRecommendations(mood: MoodType): Promise<{ tracks: SpotifyTrack[]; description: string }> {
  const genre = moodToGenres[mood];
  if (!genre) {
    return { tracks: [], description: 'No recommendations found for this mood 🎵' };
  }

  try {
    const cachedToken = await getItem(SPOTIFY_TOKEN_KEY);
    const tokenExpiry = await getItem(SPOTIFY_TOKEN_EXPIRY_KEY);

    if (cachedToken && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry, 10);
      if (expiryTime - Date.now() > 5 * 60 * 1000) {
        return await fetchTracksForMood(mood, cachedToken);
      }
    }

    const authString =
      Platform.OS === 'web'
        ? btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
        : Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

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

    await setItem(SPOTIFY_TOKEN_KEY, data.access_token);
    await setItem(SPOTIFY_TOKEN_EXPIRY_KEY, (Date.now() + data.expires_in * 1000).toString());

    return await fetchTracksForMood(mood, data.access_token);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return {
      tracks: [],
      description: 'Unable to load recommendations at this time 🎵',
    };
  }
}

async function fetchTracksForMood(mood: MoodType, token: string): Promise<{ tracks: SpotifyTrack[]; description: string }> {
  const genre = moodToGenres[mood];
  const searchQuery = `${genre} mood music playlist`;
  const searchRes = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=playlist&market=US&limit=${MAX_PLAYLISTS}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const searchData = await searchRes.json();
  const validPlaylists = searchData.playlists?.items?.filter((p: any) => p !== null) || [];
  if (validPlaylists.length === 0) {
    throw new Error('No valid playlists found for the genre');
  }

  const currentIndex = sessionPlaylistIndex[mood];
  const playlistIndex = currentIndex % validPlaylists.length;
  sessionPlaylistIndex[mood] = (currentIndex + 1) % validPlaylists.length;
  const playlist = validPlaylists[playlistIndex];

  const tracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=3`, {
    headers: { Authorization: 'Bearer ' + token },
  });
  const tracksData = await tracksRes.json();

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

  return {
    tracks,
    description: `Curated tracks from "${playlist.name}" for your ${mood} mood 🎵`,
  };
}

export async function openSpotifyLink(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch (error) {
    console.error('Error opening Spotify link:', error);
  }
}