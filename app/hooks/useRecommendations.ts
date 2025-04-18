import { useState, useCallback } from 'react';
import { getSpotifyRecommendations, type SpotifyTrack } from '../services/spotifyService';
import { getMovieRecommendations, type Movie } from '../services/tmdbService';

export function useRecommendations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [musicRecommendations, setMusicRecommendations] = useState<SpotifyTrack[]>([]);
  const [movieRecommendations, setMovieRecommendations] = useState<Movie[]>([]);

  const fetchRecommendations = useCallback(async (mood: string) => {
    try {
      setLoading(true);
      setError(null);

      const [music, movies] = await Promise.all([
        getSpotifyRecommendations(mood),
        getMovieRecommendations(mood)
      ]);

      setMusicRecommendations(music);
      setMovieRecommendations(movies);
    } catch (err) {
      setError('Failed to fetch recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    musicRecommendations,
    movieRecommendations,
    fetchRecommendations
  };
} 