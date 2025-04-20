import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MovieType } from '@/types/movie';

interface MovieCardProps {
  movie: MovieType;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <View style={styles.card}>
      <Image
        source={{ 
          uri: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : undefined
        }}
        style={styles.image}
        defaultSource={require('@/assets/images/default-movie.png')}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {movie.title}
        </Text>
        <Text style={styles.overview} numberOfLines={2}>
          {movie.overview}
        </Text>
        <View style={styles.footer}>
          <View style={styles.rating}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {movie.vote_average.toFixed(1)}
            </Text>
          </View>
          <Text style={styles.year}>
            {new Date(movie.release_date).getFullYear()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 300,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  overview: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  year: {
    fontSize: 14,
    color: '#4B5563',
  },
}); 