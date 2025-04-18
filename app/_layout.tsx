import React, { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { useColorScheme } from 'nativewind';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const { colorScheme } = useColorScheme();

  // Let the AuthProvider handle the loading state
  if (isLoading) {
    return null;
  }

  // If no user is authenticated, redirect to the auth stack
  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === 'dark' ? '#111827' : '#F9FAFB'
          }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
