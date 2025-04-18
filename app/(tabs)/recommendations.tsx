import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRecommendations } from '../providers/RecommendationsProvider';
import { MusicCard } from '../components/recommendations/MusicCard';
import { MovieCard } from '../components/recommendations/MovieCard';
import { SkeletonCard } from '../components/recommendations/SkeletonCard';
import { Ionicons } from '@expo/vector-icons';

export default function RecommendationsScreen() {
  const { recommendations, loading, error, fetchRecommendations } = useRecommendations();

  const handleRetry = () => {
    if (recommendations?.lastMood) {
      fetchRecommendations(recommendations.lastMood);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!recommendations && !loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Log your mood to get personalized recommendations!</Text>
      </View>
    );
  }

  const renderSkeletons = (type: 'music' | 'movie') => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.section}
      contentContainerStyle={styles.sectionContent}
    >
      {[...Array(5)].map((_, index) => (
        <SkeletonCard key={index} type={type} />
      ))}
    </ScrollView>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.sectionHeader}>
        <Ionicons name="musical-notes" size={24} color="#1F2937" />
        <Text style={styles.title}>Music for Your Mood</Text>
      </View>
      
      {loading ? (
        renderSkeletons('music')
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.section}
          contentContainerStyle={styles.sectionContent}
        >
          {recommendations?.music.length === 0 ? (
            <Text style={styles.emptyText}>No music recommendations available</Text>
          ) : (
            recommendations?.music.map((track) => (
              <MusicCard key={track.id} song={track} />
            ))
          )}
        </ScrollView>
      )}

      <View style={styles.sectionHeader}>
        <Ionicons name="film" size={24} color="#1F2937" />
        <Text style={styles.title}>Movies for Your Mood</Text>
      </View>

      {loading ? (
        renderSkeletons('movie')
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.section}
          contentContainerStyle={styles.sectionContent}
        >
          {recommendations?.movies.length === 0 ? (
            <Text style={styles.emptyText}>No movie recommendations available</Text>
          ) : (
            recommendations?.movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))
          )}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  section: {
    marginBottom: 24,
  },
  sectionContent: {
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  error: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
}); 