import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { MoodType } from '@/types/mood';

interface AffirmationCardProps {
  affirmation: string;
  mood: MoodType;
}

type GradientColors = readonly [string, string];

export function AffirmationCard({ affirmation, mood }: AffirmationCardProps) {
  const { colorScheme } = useColorScheme();
  const { width: screenWidth } = useWindowDimensions();
  const isDark = colorScheme === 'dark';

  const gradientColors: Record<MoodType, GradientColors> = {
    happy: ['#FFE5A3', '#FFD1A3'] as const,
    sad: ['#A3C8FF', '#89B6FF'] as const,
    energetic: ['#FFB199', '#FF9B8A'] as const,
    relaxed: ['#C1F4C1', '#A8EBA8'] as const,
    focused: ['#D4C1FF', '#C4A7FF'] as const,
    romantic: ['#FFC1E3', '#FFB3D9'] as const,
    angry: ['#FFB3B3', '#FFA3A3'] as const,
  };

  const colors: GradientColors = gradientColors[mood] || ['#E5E5E5', '#D4D4D4'] as const;
  
  // Calculate responsive dimensions
  const containerWidth = Math.min(screenWidth - 32, 600);
  const minHeight = Math.min(180, screenWidth * 0.4);
  const fontSize = screenWidth < 350 ? 16 : screenWidth < 400 ? 18 : 20;

  const styles = StyleSheet.create({
    outerContainer: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    container: {
      width: containerWidth,
      minHeight: minHeight,
      maxHeight: 250,
      borderRadius: 16,
      ...Platform.select({
        ios: {
          shadowColor: isDark ? '#000' : '#2563EB',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    gradient: {
      flex: 1,
      padding: 24,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: '#4A5568',
      fontSize: fontSize,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: fontSize * 1.4,
      textShadowColor: 'rgba(255, 255, 255, 0.5)',
      textShadowOffset: { width: 0.5, height: 0.5 },
      textShadowRadius: 2,
    },
    moodLabel: {
      color: '#4A5568',
      fontSize: 13,
      fontWeight: '500',
      opacity: 0.9,
      marginTop: 16,
      textTransform: 'capitalize',
      letterSpacing: 0.5,
    },
  });

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={styles.text}>{affirmation}</Text>
          <Text style={styles.moodLabel}>Based on your {mood} mood</Text>
        </LinearGradient>
      </View>
    </View>
  );
} 