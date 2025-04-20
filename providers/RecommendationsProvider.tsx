import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { MoodType } from '../types/mood';
import type { SpotifyTrack } from '../services/spotify';
import type { Movie } from '../services/tmdb';
import { getSpotifyRecommendations } from '../services/spotify';
import { getMovieRecommendations } from '../services/tmdb';
import { MovieType } from '@/types/movie';
import { useAuth } from '@/providers/AuthProvider';
import type { UseRecommendationsReturn, RecommendationsState } from '@/hooks/useRecommendations';

export const RecommendationsContext = createContext<UseRecommendationsReturn | null>(null);

interface RecommendationsProviderProps {
  children: React.ReactNode;
}

export function useRecommendations() {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationsProvider');
  }
  return context;
}

export function RecommendationsProvider({ children }: RecommendationsProviderProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationsState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Clear recommendations when user changes
  useEffect(() => {
    if (!user) {
      setRecommendations(null);
      setError(null);
    }
  }, [user?.id]);

  const fetchRecommendations = useCallback(async (mood: MoodType) => {
    if (!user?.id) {
      console.log('No user ID available for fetching recommendations');
      return;
    }

    console.log('\n=== Fetching Recommendations ===');
    console.log('🎭 Mood:', mood);
    console.log('👤 User:', user.id);
    
    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }

      // Fetch both movie and music recommendations in parallel
      const [movieData, musicData] = await Promise.all([
        getMovieRecommendations(mood),
        getSpotifyRecommendations(mood)
      ]);

      // Log results
      console.log('\n🎬 Movie Results:', {
        moviesCount: movieData.movies.length,
        description: movieData.description,
        sampleMovie: movieData.movies[0]?.title || 'No movies'
      });

      console.log('\n🎵 Music Results:', {
        tracksCount: musicData.tracks.length,
        description: musicData.description,
        sampleTrack: musicData.tracks[0]?.name || 'No tracks'
      });

      if (isMounted.current) {
        // Handle empty recommendations
        if (!movieData.movies.length && !musicData.tracks.length) {
          const error = 'No recommendations available for this mood';
          console.error('\n❌ Recommendation Error:', {
            error,
            mood,
            moviesEmpty: true,
            musicEmpty: true
          });
          setError(error);
          return;
        }

        setRecommendations({
          movies: movieData.movies.map((movie: Movie) => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            genre_ids: movie.genre_ids
          })),
          movieDescription: movieData.description,
          music: musicData.tracks,
          musicDescription: musicData.description,
          lastMood: mood
        });

        console.log('\n✅ Recommendations updated successfully:', {
          movies: movieData.movies.length,
          tracks: musicData.tracks.length,
          mood,
          userId: user.id
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recommendations';
      console.error('\n❌ Error fetching recommendations:', {
        error: errorMessage,
        mood,
        userId: user.id,
        type: err instanceof Error ? err.constructor.name : typeof err
      });
      
      if (isMounted.current) {
        setError(errorMessage);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      console.log('=== End Recommendations Fetch ===\n');
    }
  }, [user?.id]);

  const clearRecommendations = useCallback(() => {
    if (isMounted.current) {
      setRecommendations(null);
      setError(null);
    }
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