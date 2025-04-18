const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

const moodToGenres: Record<string, number[]> = {
  happy: [35, 10402], // Comedy, Music
  sad: [18, 10749], // Drama, Romance
  energetic: [28, 12], // Action, Adventure
  relaxed: [16, 14], // Animation, Fantasy
  focused: [99, 36], // Documentary, History
};

export async function getMovieRecommendations(mood: string): Promise<Array<{
  id: number;
  title: string;
  posterUrl: string;
  releaseYear: string;
  rating: number;
}>> {
  try {
    const genres = moodToGenres[mood.toLowerCase()] || [28, 35]; // Default to Action and Comedy
    const genreIds = genres.join(',');

    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreIds}&sort_by=popularity.desc&page=1`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get movie recommendations');
    }

    const data = await response.json();
    return data.results.slice(0, 10).map((movie: TMDBMovie) => ({
      id: movie.id,
      title: movie.title,
      posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '',
      releaseYear: movie.release_date ? movie.release_date.split('-')[0] : '',
      rating: Math.round(movie.vote_average * 10) / 10,
    }));
  } catch (error) {
    console.error('Error getting movie recommendations:', error);
    throw error;
  }
}

export function getMovieDetailsUrl(movieId: number): string {
  return `https://www.themoviedb.org/movie/${movieId}`;
} 