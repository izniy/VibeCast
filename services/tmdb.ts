import { MoodType } from '../types/mood';

declare const window: any; // Fix for TS2304

const TMDB_TOKEN = process.env.EXPO_PUBLIC_TMDB_READ_ACCESS_TOKEN;

if (!TMDB_TOKEN) {
  throw new Error('Missing TMDB token in environment variables');
}

const isWeb = typeof window !== 'undefined';

function getSessionPage(mood: MoodType): number {
  if (isWeb) {
    const stored = window.sessionStorage.getItem(`tmdb_page_${mood}`);
    return stored ? parseInt(stored, 10) || 1 : 1;
  }
  return sessionPageIndex[mood];
}

function incrementSessionPage(mood: MoodType, max: number = MAX_PAGE) {
  if (isWeb) {
    const current = getSessionPage(mood);
    const next = (current % max) + 1;
    window.sessionStorage.setItem(`tmdb_page_${mood}`, next.toString());
  } else {
    sessionPageIndex[mood] = (sessionPageIndex[mood] % max) + 1;
  }
}

const sessionPageIndex: Record<MoodType, number> = {
  happy: 1,
  sad: 1,
  energetic: 1,
  relaxed: 1,
  focused: 1,
  romantic: 1,
  angry: 1,
};

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

const moodToGenres: Record<MoodType, { genres: number[]; description: string }> = {
  happy: {
    genres: [35, 16, 10402],
    description: 'Feel-good movies to match your mood',
  },
  sad: {
    genres: [18, 10749, 10751],
    description: 'Heartwarming and emotional stories',
  },
  energetic: {
    genres: [28, 12, 878],
    description: 'High-energy and thrilling films',
  },
  relaxed: {
    genres: [16, 14, 10751],
    description: 'Calming and easy-going content',
  },
  focused: {
    genres: [99, 9648, 878],
    description: 'Engaging and thought-provoking films',
  },
  romantic: {
    genres: [10749, 35, 18],
    description: 'Love stories and romantic tales',
  },
  angry: {
    genres: [28, 27, 53],
    description: 'Intense and cathartic movies',
  },
};

export async function getMovieRecommendations(mood: MoodType): Promise<{ movies: Movie[]; description: string }> {
  try {
    console.log("entermovie")
    const moodMapping = moodToGenres[mood];
    let url = 'https://api.themoviedb.org/3/discover/movie';
    let description = 'Popular movies you might enjoy';

    const currentPage = getSessionPage(mood);
    incrementSessionPage(mood);

    if (moodMapping) {
      const genres = moodMapping.genres.join(',');
      url += `?with_genres=${genres}&sort_by=popularity.desc&vote_count.gte=100&page=${currentPage}`;
      description = moodMapping.description;
    } else {
      url += `?sort_by=popularity.desc&vote_count.gte=200&page=${currentPage}`;
    }

    console.log('🎬 Fetching movies:', {
      mood,
      page: currentPage,
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

    if (currentPage > data.total_pages) {
      if (isWeb) {
        window.sessionStorage.setItem(`tmdb_page_${mood}`, '1');
      } else {
        sessionPageIndex[mood] = 1;
      }
      return getMovieRecommendations(mood);
    }

    return {
      movies: data.results.slice(0, 10),
      description: `${description} (Page ${currentPage})`,
    };
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    if (isWeb) {
      window.sessionStorage.setItem(`tmdb_page_${mood}`, '1');
    } else {
      sessionPageIndex[mood] = 1;
    }

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