const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  throw new Error('TMDB API key not found in environment variables');
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

const moodToGenres: Record<string, number[]> = {
  happy: [35, 10402], // Comedy, Music
  sad: [18, 10749], // Drama, Romance
  energetic: [28, 12], // Action, Adventure
  calm: [99, 36], // Documentary, History
  anxious: [27, 53], // Horror, Thriller
  romantic: [10749, 35], // Romance, Comedy
};

export async function getMovieRecommendations(mood: string): Promise<Movie[]> {
  try {
    const genres = moodToGenres[mood.toLowerCase()] || [28, 35]; // Default to Action, Comedy
    const genreString = genres.join(',');

    const response = await fetch(
      `${BASE_URL}/discover/movie?with_genres=${genreString}&sort_by=popularity.desc&page=1`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch movie recommendations');
    }

    const data = await response.json();
    return data.results.slice(0, 10);
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    throw error;
  }
} 