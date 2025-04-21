import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'VibeCast',
  slug: 'VibeCast',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.vibecast.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.vibecast.app'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    spotifyClientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID,
    spotifyClientSecret: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET,
    tmdbReadAccessToken: process.env.EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN,
    eas: {
      projectId: "8ad3d7a9-d4b3-44a8-938f-df925dfd1c46"
    }
  },
  plugins: [
    'expo-font',
    'expo-secure-store',
    'expo-router'
  ]
});