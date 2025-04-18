import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface SkeletonCardProps {
  type: 'music' | 'movie';
}

export function SkeletonCard({ type }: SkeletonCardProps) {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, []);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.5, 0.3],
  });

  const imageHeight = type === 'music' ? 160 : 210;

  return (
    <View style={[styles.container, type === 'music' ? styles.musicCard : styles.movieCard]}>
      <Animated.View style={[styles.image, { opacity, height: imageHeight }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.title, { opacity }]} />
        <Animated.View style={[styles.subtitle, { opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  musicCard: {
    width: 160,
  },
  movieCard: {
    width: 140,
  },
  image: {
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  content: {
    padding: 12,
  },
  title: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  subtitle: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '70%',
  },
}); 