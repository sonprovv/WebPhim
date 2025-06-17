import { useState, useCallback, useEffect } from 'react';
import { api, Movie, MoviesResponse, MovieType, MOVIE_TYPES } from '@/lib/api';

interface UseMoviesOptions {
  type?: string; // This can be a category slug or a list type like 'phim-moi-cap-nhat'
  fetchType?: 'latest' | 'category' | 'list'; // New property to distinguish API calls
  initialPage?: number;
  filters?: {
    category?: string;
    country?: string;
    year?: number;
    sort_field?: string;
    sort_type?: string;
    sort_lang?: string;
  };
}

export function useMovies({
  type = 'phim-moi-cap-nhat',
  fetchType = 'latest',
  initialPage = 1,
  filters = {},
}: UseMoviesOptions = {}) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response: MoviesResponse;
      if (fetchType === 'latest') {
        response = await api.getLatestMovies({ page });
      } else if (fetchType === 'category' && type) {
        // Call getMoviesByCategory with type as slug
        response = await api.getMoviesByCategory(type, {
          page,
          limit: 20, // Default limit
          ...filters,
          sort_field: filters.sort_field as '_id' | 'modified.time' | 'year' | undefined,
          sort_type: filters.sort_type as 'asc' | 'desc' | undefined,
          sort_lang: filters.sort_lang as 'vietsub' | 'thuyet-minh' | 'long-tieng' | undefined,
        });
      } else if (fetchType === 'list' && type) {
        if (!MOVIE_TYPES.includes(type as MovieType)) {
          throw new Error(`Invalid movie type: ${type}`);
        }
        // Call getMovieList for other general lists
        response = await api.getMovieList(type as MovieType, {
          page,
          limit: 20, // Default limit
          ...filters,
          sort_field: filters.sort_field as '_id' | 'modified.time' | 'year' | undefined,
          sort_type: filters.sort_type as 'asc' | 'desc' | undefined,
          sort_lang: filters.sort_lang as 'vietsub' | 'thuyet-minh' | 'long-tieng' | undefined,
        });
      } else {
        throw new Error("Invalid fetch type or missing type parameter.");
      }

      let cdnImageDomain = response.data.APP_DOMAIN_CDN_IMAGE;
      if (cdnImageDomain && !cdnImageDomain.startsWith('http://') && !cdnImageDomain.startsWith('https://')) {
        cdnImageDomain = `https://${cdnImageDomain}`;
      } else if (!cdnImageDomain) {
        cdnImageDomain = 'https://phimimg.com';
      }

      const processedMovies = response.data.items.map(movie => ({
        ...movie,
        poster_url: movie.poster_url
          ? (movie.poster_url.startsWith('http') ? movie.poster_url : `${cdnImageDomain}/${movie.poster_url}`.replace(/([^:]\/)\/+/g, '$1'))
          : '/placeholder.jpg',
        thumb_url: movie.thumb_url
          ? (movie.thumb_url.startsWith('http') ? movie.thumb_url : `${cdnImageDomain}/${movie.thumb_url}`.replace(/([^:]\/)\/+/g, '$1'))
          : '/placeholder.jpg',
      }));

      setMovies(processedMovies);
      setTotalPages(response.data.params.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [type, fetchType, page, filters]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return {
    movies,
    loading,
    error,
    page,
    totalPages,
    setPage,
    refetch: fetchMovies,
  };
} 