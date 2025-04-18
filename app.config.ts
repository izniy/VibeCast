import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'VibeCast',
  slug: 'mood-tracker',
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
    // Environment variables will be automatically included
    // because they start with EXPO_PUBLIC_
  },
  plugins: [
    'expo-font',
    'expo-secure-store',
    'expo-router'
  ]
});