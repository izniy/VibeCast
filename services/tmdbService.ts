if (!process.env.EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN) {
  throw new Error('TMDB Read Access Token is not configured in environment variables');
}

const TMDB_ACCESS_TOKEN = process.env.EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

const moodToGenres: Record<string, number[]> = {
  happy: [35, 10402], // Comedy, Music
  sad: [18, 10749], // Drama, Romance
  stressed: [53], // Thriller
  relaxed: [16, 14], // Animation, Fantasy
  angry: [28, 80], // Action, Crime
};

export async function getMovieRecommendations(mood: string): Promise<Movie[]> {
  try {
    const genres = moodToGenres[mood.toLowerCase()] || [28, 35]; // Default to Action and Comedy
    const params = new URLSearchParams({
      with_genres: genres.join(','),
      sort_by: 'popularity.desc',
      language: 'en-US',
      page: '1'
    });

    const response = await fetch(
      `${BASE_URL}/discover/movie?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get movie recommendations');
    }

    const data = await response.json();
    return data.results.slice(0, 10).map((movie: any): Movie => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path || '',
      release_date: movie.release_date || '',
      vote_average: Math.round(movie.vote_average * 10) / 10
    }));
  } catch (error) {
    console.error('Error getting movie recommendations:', error);
    return [];
  }
}

export function getMovieDetailsUrl(movieId: number): string {
  return `https://www.themoviedb.org/movie/${movieId}`;
} 