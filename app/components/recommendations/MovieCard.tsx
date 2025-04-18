import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const handlePress = async () => {
    const tmdbUrl = `https://www.themoviedb.org/movie/${movie.id}`;
    await Linking.openURL(tmdbUrl);
  };

  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  const year = movie.release_date.split('-')[0];
  const rating = Math.round(movie.vote_average * 10) / 10;

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image 
        source={{ uri: posterUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {movie.title}
        </Text>
        <View style={styles.details}>
          <Text style={styles.year}>{year}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
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
  image: {
    width: '100%',
    height: 210,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  year: {
    fontSize: 12,
    color: '#6B7280',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
}); 