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
      width: type === 'music' ? '100%' : type === 'affirmation' ? '100%' : 200,
      height: type === 'music' ? 84 : type === 'affirmation' ? 200 : 300,
      opacity: 0.7,
      flexDirection: type === 'music' ? 'row' : 'column',
      alignItems: type === 'music' ? 'center' : 'stretch',
      padding: type === 'music' ? 12 : 0,
      marginVertical: type === 'music' ? 6 : 0,
      marginHorizontal: type === 'music' ? 16 : 0,
    },
    image: {
      width: type === 'music' ? 60 : '100%',
      height: type === 'music' ? 60 : type === 'affirmation' ? '100%' : 200,
      backgroundColor: isDark ? '#4B5563' : '#D1D5DB',
      borderRadius: type === 'music' ? 8 : 0,
    },
    content: {
      padding: type === 'music' ? 0 : 12,
      marginLeft: type === 'music' ? 12 : 0,
      flex: type === 'music' ? 1 : undefined,
    },
    title: {
      height: 16,
      backgroundColor: isDark ? '#4B5563' : '#D1D5DB',
      borderRadius: 4,
      marginBottom: 8,
      width: type === 'music' ? '80%' : '100%',
    },
    subtitle: {
      height: 14,
      backgroundColor: isDark ? '#4B5563' : '#D1D5DB',
      borderRadius: 4,
      width: type === 'music' ? '50%' : '60%',
    },
    playButton: {
      width: 24,
      height: 24,
      backgroundColor: isDark ? '#4B5563' : '#D1D5DB',
      borderRadius: 12,
      marginLeft: 8,
    },
  });

  if (type === 'music') {
    return (
      <View style={styles.container}>
        <View style={styles.image} />
        <View style={styles.content}>
          <View style={styles.title} />
          <View style={styles.subtitle} />
        </View>
        <View style={styles.playButton} />
      </View>
    );
  }

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