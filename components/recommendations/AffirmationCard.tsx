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
    happy: ['#FFD700', '#FFA500'] as const,
    sad: ['#4169E1', '#1E90FF'] as const,
    energetic: ['#FF4500', '#FF6347'] as const,
    relaxed: ['#98FB98', '#90EE90'] as const,
    focused: ['#9370DB', '#8A2BE2'] as const,
    romantic: ['#FF69B4', '#FF1493'] as const,
    angry: ['#DC143C', '#FF0000'] as const,
  };

  const colors: GradientColors = gradientColors[mood] || ['#A9A9A9', '#808080'] as const;
  
  // Calculate responsive dimensions
  const containerWidth = Math.min(screenWidth - 32, 600); // Max width of 600, minus margins
  const minHeight = Math.min(180, screenWidth * 0.4); // Responsive height based on screen width
  const fontSize = screenWidth < 350 ? 18 : screenWidth < 400 ? 20 : 22;

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
      borderRadius: 16, // Match container borderRadius
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: '#FFFFFF',
      fontSize: fontSize,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: fontSize * 1.4,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    moodLabel: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
      opacity: 0.85,
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