import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { moodService } from '../services/moodService';
import { MusicCard } from '../components/recommendations/MusicCard';
import { MovieCard } from '../components/recommendations/MovieCard';
import { SkeletonCard } from '../components/recommendations/SkeletonCard';
import { getSpotifyRecommendations, SpotifyTrack } from '../services/spotifyService';
import { getMovieRecommendations, Movie } from '../services/tmdbService';
import { Ionicons } from '@expo/vector-icons';
import { Database } from '../types/database';

type MoodEntry = Database['public']['Tables']['mood_entries']['Row'];
type ValidMood = 'happy' | 'sad' | 'stressed' | 'angry' | 'relaxed';

interface Recommendations {
  music: SpotifyTrack[];
  movies: Movie[];
}

export default function RecommendationsScreen() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendations>({ music: [], movies: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestMood, setLatestMood] = useState<ValidMood | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fadeIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fetchRecommendations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get the user's latest mood
      const latestEntry = await moodService.getLatestMoodEntry(user.id);
      if (!latestEntry) {
        setError('No mood entries found. Log your mood to get recommendations!');
        return;
      }

      // Type guard to ensure mood is valid
      const mood = latestEntry.mood.toLowerCase() as ValidMood;
      if (!isValidMood(mood)) {
        setError('Invalid mood type found');
        return;
      }

      setLatestMood(mood);

      // Fetch recommendations based on mood
      const [musicResults, movieResults] = await Promise.all([
        getSpotifyRecommendations(mood),
        getMovieRecommendations(mood)
      ]);

      setRecommendations({
        music: musicResults,
        movies: movieResults
      });
      fadeIn();
    } catch (err) {
      setError('Failed to load recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Type guard function
  const isValidMood = (mood: string): mood is ValidMood => {
    return ['happy', 'sad', 'stressed', 'angry', 'relaxed'].includes(mood);
  };

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

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRecommendations}>
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {latestMood && (
        <Text style={styles.subtitle}>
          Based on your {latestMood} mood
        </Text>
      )}

      <View style={styles.sectionHeader}>
        <Ionicons name="musical-notes" size={24} color="#1F2937" />
        <Text style={styles.title}>Music for Your Mood</Text>
      </View>
      
      {loading ? (
        renderSkeletons('music')
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.section}
            contentContainerStyle={styles.sectionContent}
          >
            {recommendations.music.length === 0 ? (
              <Text style={styles.emptyText}>No music recommendations available</Text>
            ) : (
              recommendations.music.map((track) => (
                <MusicCard key={track.id} song={track} />
              ))
            )}
          </ScrollView>
        </Animated.View>
      )}

      <View style={styles.sectionHeader}>
        <Ionicons name="film" size={24} color="#1F2937" />
        <Text style={styles.title}>Movies for Your Mood</Text>
      </View>

      {loading ? (
        renderSkeletons('movie')
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.section}
            contentContainerStyle={styles.sectionContent}
          >
            {recommendations.movies.length === 0 ? (
              <Text style={styles.emptyText}>No movie recommendations available</Text>
            ) : (
              recommendations.movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))
            )}
          </ScrollView>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 60,
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
  subtitle: {
    fontSize: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 30,
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
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
}); 