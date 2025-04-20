import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/providers/AuthProvider';
import { RecommendationsProvider } from '@/providers/RecommendationsProvider';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  useFrameworkReady();
  const { colorScheme } = useColorScheme();

  return (
    <AuthProvider>
      <RecommendationsProvider>
        <Stack />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </RecommendationsProvider>
    </AuthProvider>
  );
}
