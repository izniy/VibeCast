import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';

interface SkeletonCardProps {
  type: 'music' | 'movie' | 'affirmation';
}

export function SkeletonCard({ type }: SkeletonCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#374151' : '#E5E7EB',
      borderRadius: 12,
      overflow: 'hidden',
      marginRight: type === 'affirmation' ? 0 : 12,
      width: type === 'affirmation' ? '100%' : 200,
      height: type === 'affirmation' ? 200 : 300,
      opacity: 0.7,
    },
    image: {
      width: '100%',
      height: type === 'affirmation' ? '100%' : 200,
      backgroundColor: isDark ? '#4B5563' : '#D1D5DB',
    },
    content: {
      padding: 12,
    },
    title: {
      height: 16,
      backgroundColor: isDark ? '#4B5563' : '#D1D5DB',
      borderRadius: 4,
      marginBottom: 8,
    },
    subtitle: {
      height: 14,
      backgroundColor: isDark ? '#4B5563' : '#D1D5DB',
      borderRadius: 4,
      width: '60%',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.image} />
      {type !== 'affirmation' && (
        <View style={styles.content}>
          <View style={styles.title} />
          <View style={styles.subtitle} />
        </View>
      )}
    </View>
  );
} 