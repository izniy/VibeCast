import { useContext } from 'react';
import { RecommendationsContext } from '@/providers/RecommendationsProvider';
import { useState, useEffect } from 'react';
import { MoodType } from '@/types/mood';
import { MovieType } from '@/types/movie';

interface RecommendationsState {
  lastMood: MoodType;
  movies: MovieType[];
  movieDescription?: string;
}

interface UseRecommendationsReturn {
  recommendations: RecommendationsState | null;
  loading: boolean;
  error: string | null;
  fetchRecommendations: (mood: MoodType) => Promise<void>;
}

export function useRecommendations() {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationsProvider');
  }
  return context;
} 