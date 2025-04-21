import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/providers/AuthProvider';
import { RecommendationsProvider } from '@/providers/RecommendationsProvider';
import { useColorScheme } from 'nativewind';
import { View, Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function AppContent() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <View style={[
        styles.mainContainer,
        { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }
      ]}>
        <View style={[
          styles.statusBarFill,
          { 
            height: Platform.OS === 'web' ? 0 : insets.top,
            backgroundColor: isDark ? '#1F2937' : '#E0E7FF'
          }
        ]} />
        <Stack 
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: isDark ? '#1F2937' : '#F3F4F6'
            }
          }}
        />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </View>
    </View>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider theme={useColorScheme().colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme}>
          <AuthProvider>
            <RecommendationsProvider>
              <AppContent />
            </RecommendationsProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  statusBarFill: {
    width: '100%',
  }
});
