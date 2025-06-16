import { useState, useCallback, useEffect } from 'react';
import { api, Movie, MoviesResponse } from '@/lib/api';

interface UseMoviesOptions {
  type?: string;
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
      if (type === 'phim-moi-cap-nhat') {
        response = await api.getLatestMovies({ page });
      } else {
        response = await api.getMovieList(type, {
          page,
          ...filters,
          sort_field: filters.sort_field as '_id' | 'modified.time' | 'year' | undefined,
          sort_type: filters.sort_type as 'asc' | 'desc' | undefined,
          sort_lang: filters.sort_lang as 'vietsub' | 'thuyet-minh' | 'long-tieng' | undefined,
        });
      }

      setMovies(response.data.items);
      setTotalPages(response.data.params.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [type, page, filters]);

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