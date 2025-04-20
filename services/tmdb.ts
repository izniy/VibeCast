import { MoodType } from '../types/mood';

const TMDB_TOKEN = process.env.EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN;

if (!TMDB_TOKEN) {
  throw new Error('Missing TMDB token in environment variables');
}

// Session-based page index for rotation
const sessionPageIndex: Record<MoodType, number> = {
  happy: 1,
  sad: 1,
  energetic: 1,
  relaxed: 1,
  focused: 1,
  romantic: 1,
  angry: 1,
};

// Maximum page number to rotate through
const MAX_PAGE = 5;

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
  total_pages: number;
}

// TMDB Genre IDs:
// 28: Action        12: Adventure     16: Animation    35: Comedy
// 80: Crime         99: Documentary   18: Drama        10751: Family
// 14: Fantasy       36: History       27: Horror       10402: Music
// 9648: Mystery     10749: Romance    878: Sci-Fi      53: Thriller
// 10752: War        37: Western

const moodToGenres: Record<MoodType, { genres: number[]; description: string }> = {
  happy: {
    genres: [35, 16, 10402], // Comedy, Animation, Music
    description: 'Feel-good movies to match your mood',
  },
  sad: {
    genres: [18, 10749, 10751], // Drama, Romance, Family
    description: 'Heartwarming and emotional stories',
  },
  energetic: {
    genres: [28, 12, 878], // Action, Adventure, Sci-Fi
    description: 'High-energy and thrilling films',
  },
  relaxed: {
    genres: [16, 14, 10751], // Animation, Fantasy, Family
    description: 'Calming and easy-going content',
  },
  focused: {
    genres: [99, 9648, 878], // Documentary, Mystery, Sci-Fi
    description: 'Engaging and thought-provoking films',
  },
  romantic: {
    genres: [10749, 35, 18], // Romance, Comedy, Drama
    description: 'Love stories and romantic tales',
  },
  angry: {
    genres: [28, 27, 53], // Action, Horror, Thriller
    description: 'Intense and cathartic movies',
  },
};

/**
 * Get movie recommendations based on mood
 */
export async function getMovieRecommendations(mood: MoodType): Promise<{ movies: Movie[]; description: string }> {
  try {
    const moodMapping = moodToGenres[mood];
    let url = 'https://api.themoviedb.org/3/discover/movie';
    let description = 'Popular movies you might enjoy';

    // Get the current page for this mood and increment it
    const currentPage = sessionPageIndex[mood];
    sessionPageIndex[mood] = (currentPage % MAX_PAGE) + 1;

    if (moodMapping) {
      const genres = moodMapping.genres.join(',');
      url += `?with_genres=${genres}&sort_by=popularity.desc&vote_count.gte=100&page=${currentPage}`;
      description = moodMapping.description;
    } else {
      // Fallback to popular movies if no mood mapping found
      url += `?sort_by=popularity.desc&vote_count.gte=200&page=${currentPage}`;
    }

    console.log('🎬 Fetching movies:', {
      mood,
      page: currentPage,
      nextPage: sessionPageIndex[mood],
      genres: moodMapping?.genres,
    });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TMDB_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch movie recommendations');
    }

    const data: TMDBResponse = await response.json();
    
    // If we got an invalid page, reset to page 1
    if (currentPage > data.total_pages) {
      sessionPageIndex[mood] = 1;
      return getMovieRecommendations(mood);
    }
    
    return {
      movies: data.results.slice(0, 10), // Return top 10 movies
      description: `${description} (Page ${currentPage})`,
    };
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    // Reset page index on error
    sessionPageIndex[mood] = 1;
    
    // Return popular movies as fallback
    const fallbackResponse = await fetch(
      'https://api.themoviedb.org/3/movie/popular?page=1',
      {
        headers: {
          Authorization: `Bearer ${TMDB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!fallbackResponse.ok) {
      throw error;
    }

    const fallbackData: TMDBResponse = await fallbackResponse.json();
    return {
      movies: fallbackData.results.slice(0, 10),
      description: 'Popular movies you might enjoy',
    };
  }
} 