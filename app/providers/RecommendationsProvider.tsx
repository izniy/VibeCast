import React, { createContext, useContext, useState, useCallback } from 'react';
import type { MoodType } from '../types/mood';
import type { SpotifyTrack } from '../services/spotify';
import type { Movie } from '../services/tmdb';
import { getSpotifyRecommendations } from '../services/spotify';
import { getMovieRecommendations } from '../services/tmdb';

interface Recommendations {
  music: SpotifyTrack[];
  movies: Movie[];
  lastMood: MoodType;
}

interface RecommendationsContextType {
  recommendations: Recommendations | null;
  loading: boolean;
  error: string | null;
  fetchRecommendations: (mood: MoodType) => Promise<void>;
  clearRecommendations: () => void;
}

const RecommendationsContext = createContext<RecommendationsContextType | null>(null);

export function useRecommendations() {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationsProvider');
  }
  return context;
}

interface RecommendationsProviderProps {
  children: React.ReactNode;
}

export function RecommendationsProvider({ children }: RecommendationsProviderProps) {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (mood: MoodType) => {
    try {
      setLoading(true);
      setError(null);

      const [musicResults, movieResults] = await Promise.all([
        getSpotifyRecommendations(mood),
        getMovieRecommendations(mood)
      ]);

      setRecommendations({
        music: musicResults,
        movies: movieResults,
        lastMood: mood
      });
    } catch (err) {
      setError('Failed to load recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRecommendations = useCallback(() => {
    setRecommendations(null);
    setError(null);
  }, []);

  return (
    <RecommendationsContext.Provider
      value={{
        recommendations,
        loading,
        error,
        fetchRecommendations,
        clearRecommendations
      }}
    >
      {children}
    </RecommendationsContext.Provider>
  );
} 