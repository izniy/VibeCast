import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { MoodType } from '../types/mood';
import type { SpotifyTrack } from '../services/spotify';
import type { Movie } from '../services/tmdb';
// import { getSpotifyRecommendations, debugSpotifyCategories, clearSpotifyCache } from '../services/spotify';
import { getMovieRecommendations } from '../services/tmdb';
import { MovieType } from '@/types/movie';

interface RecommendationsState {
  lastMood: MoodType;
  movies: MovieType[];
  movieDescription?: string;
}

interface RecommendationsContextType {
  recommendations: RecommendationsState | null;
  loading: boolean;
  error: string | null;
  fetchRecommendations: (mood: MoodType) => Promise<void>;
  clearRecommendations: () => void;
}

export const RecommendationsContext = createContext<RecommendationsContextType | null>(null);

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
  const [recommendations, setRecommendations] = useState<RecommendationsState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchRecommendations = useCallback(async (mood: MoodType) => {
    console.log('\n=== Fetching Recommendations ===');
    console.log('🎭 Mood:', mood);
    
    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }

      // Fetch movie recommendations only
      console.log('🔄 Fetching movies...');
      const movieData = await getMovieRecommendations(mood);

      // Log movie results
      console.log('\n🎬 Movie Results:', {
        moviesCount: movieData.movies.length,
        description: movieData.description,
        sampleMovie: movieData.movies[0]?.title || 'No movies'
      });

      if (isMounted.current) {
        // Handle empty recommendations
        if (!movieData.movies.length) {
          const error = 'No recommendations available for this mood';
          console.error('\n❌ Recommendation Error:', {
            error,
            mood,
            moviesEmpty: true
          });
          setError(error);
          return;
        }

        setRecommendations({
          movies: movieData.movies.map(movie => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            genre_ids: movie.genre_ids
          })),
          movieDescription: `Here are some movies that match your ${mood} mood`,
          lastMood: mood
        });

        console.log('\n✅ Recommendations updated successfully:', {
          movies: movieData.movies.length,
          mood
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recommendations';
      console.error('\n❌ Error fetching recommendations:', {
        error: errorMessage,
        mood,
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
  }, []);

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