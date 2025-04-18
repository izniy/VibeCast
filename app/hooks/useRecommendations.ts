import { useState } from 'react';
import { spotifyService } from '../services/spotify';
import { tmdbService } from '../services/tmdb';

interface Recommendation {
  music: any[];
  movies: any[];
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation>({
    music: [],
    movies: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchRecommendations(mood: string) {
    setLoading(true);
    setError(null);

    try {
      const [musicResults, movieResults] = await Promise.all([
        spotifyService.getRecommendationsByMood(mood),
        tmdbService.getRecommendationsByMood(mood),
      ]);

      setRecommendations({
        music: musicResults,
        movies: movieResults,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  }

  function clearRecommendations() {
    setRecommendations({
      music: [],
      movies: [],
    });
    setError(null);
  }

  return {
    recommendations,
    loading,
    error,
    fetchRecommendations,
    clearRecommendations,
  };
} 