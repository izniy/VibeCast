import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface MovieCardProps {
  title: string;
  posterPath: string;
  releaseYear: string;
  rating: number;
  onPress: () => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ 
  title, 
  posterPath, 
  releaseYear, 
  rating, 
  onPress 
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image 
        source={{ uri: `https://image.tmdb.org/t/p/w500${posterPath}` }} 
        style={styles.image} 
      />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.detailsContainer}>
          <Text style={styles.year}>{releaseYear}</Text>
          <Text style={styles.rating}>★ {rating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 150,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 225,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  textContainer: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  year: {
    fontSize: 12,
    color: '#666',
  },
  rating: {
    fontSize: 12,
    color: '#FFB800',
    fontWeight: '600',
  },
}); 