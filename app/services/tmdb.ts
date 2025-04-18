import { MoodType } from '../types/mood';

const TMDB_TOKEN = process.env.EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN;

if (!TMDB_TOKEN) {
  throw new Error('Missing TMDB token in environment variables');
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBResponse {
  results: Movie[];
}

const moodToGenres: Record<MoodType, number[]> = {
  happy: [35, 10402], // Comedy, Music
  sad: [18, 10749], // Drama, Romance
  energetic: [28, 12], // Action, Adventure
  relaxed: [16, 14], // Animation, Fantasy
  focused: [99, 878], // Documentary, Science Fiction
  romantic: [10749, 10751], // Romance, Family
  angry: [28, 27], // Action, Horror
};

/**
 * Get movie recommendations based on mood
 */
export async function getMovieRecommendations(mood: MoodType): Promise<Movie[]> {
  try {
    const genres = moodToGenres[mood].join(',');
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?with_genres=${genres}&sort_by=popularity.desc&page=1`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch movie recommendations');
    }

    const data: TMDBResponse = await response.json();
    return data.results.slice(0, 10); // Return top 10 movies
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    throw error;
  }
} 