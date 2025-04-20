import { useContext } from 'react';
import { RecommendationsContext } from '@/providers/RecommendationsProvider';
import type { MoodType } from '@/types/mood';
import type { MovieType } from '@/types/movie';
import type { SpotifyTrack } from '@/services/spotify';

export interface RecommendationsState {
  lastMood: MoodType;
  movies: MovieType[];
  movieDescription?: string;
  music: SpotifyTrack[];
  musicDescription?: string;
}

export interface UseRecommendationsReturn {
  recommendations: RecommendationsState | null;
  loading: boolean;
  error: string | null;
  fetchRecommendations: (mood: MoodType) => Promise<void>;
  clearRecommendations: () => void;
}

export function useRecommendations(): UseRecommendationsReturn {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationsProvider');
  }
  return context;
} 