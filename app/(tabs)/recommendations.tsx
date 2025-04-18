import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { supabase } from '../../lib/supabaseClient';
import { MusicCard } from '../../components/MusicCard';
import { MovieCard } from '../../components/MovieCard';
import { SpotifyService } from '../../services/spotify';
import { TMDBService } from '../../services/tmdb';

interface Recommendations {
  music: any[];
  movies: any[];
}

export default function RecommendationsScreen() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendations>({ music: [], movies: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the user's latest mood from Supabase
      const { data: moodLogs } = await supabase
        .from('mood_logs')
        .select('mood')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const latestMood = moodLogs?.[0]?.mood || 'neutral';

      // Fetch recommendations based on mood
      const [musicResults, movieResults] = await Promise.all([
        SpotifyService.getRecommendationsByMood(latestMood),
        TMDBService.getRecommendationsByMood(latestMood),
      ]);

      setRecommendations({
        music: musicResults,
        movies: movieResults,
      });
    } catch (err) {
      setError('Failed to load recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Music for Your Mood</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.section}>
        {recommendations.music.map((track) => (
          <MusicCard
            key={track.id}
            title={track.name}
            artist={track.artists[0].name}
            albumArt={track.album.images[0].url}
            onPress={() => {/* Handle music selection */}}
          />
        ))}
      </ScrollView>

      <Text style={styles.title}>Movies for Your Mood</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.section}>
        {recommendations.movies.map((movie) => (
          <MovieCard
            key={movie.id}
            title={movie.title}
            posterPath={movie.poster_path}
            releaseYear={movie.release_date.split('-')[0]}
            rating={movie.vote_average}
            onPress={() => {/* Handle movie selection */}}
          />
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 16,
    color: '#1F2937',
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  error: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 16,
  },
}); 