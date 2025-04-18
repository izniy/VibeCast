import { MoodType } from './mood';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

if (!process.env.EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN) {
  throw new Error('TMDB Read Access Token is not configured in environment variables');
}

const TMDB_ACCESS_TOKEN = process.env.EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN;

export interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  releaseYear: string;
  rating: number;
}

export interface TMDBError {
  message: string;
  status: number;
}

export type TMDBResponse<T> = {
  data: T | null;
  error: TMDBError | null;
};

const moodToGenres: Record<MoodType, number[]> = {
  happy: [35, 10402], // Comedy, Music
  sad: [18, 10749], // Drama, Romance
  stressed: [53], // Thriller
  relaxed: [16, 14], // Animation, Fantasy
  angry: [28, 80], // Action, Crime
};

/**
 * Get movie recommendations based on mood
 */
export async function getMovieRecommendations(
  mood: MoodType
): Promise<TMDBResponse<Movie[]>> {
  try {
    const genres = moodToGenres[mood];
    const params = new URLSearchParams({
      with_genres: genres.join(','),
      sort_by: 'popularity.desc',
      language: 'en-US',
      page: '1'
    });

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: 'Failed to get movie recommendations',
          status: response.status
        }
      };
    }

    const data = await response.json();
    
    const movies: Movie[] = data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      posterUrl: movie.poster_path 
        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : '',
      releaseYear: movie.release_date 
        ? movie.release_date.split('-')[0]
        : '',
      rating: Math.round(movie.vote_average * 10) / 10
    }));

    return {
      data: movies.slice(0, 10), // Return top 10 movies
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500
      }
    };
  }
} 