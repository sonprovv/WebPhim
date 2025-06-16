'use client';

import { useMovies } from '@/hooks/useMovies';
import { MovieList } from '@/components/MovieList';
import { MovieFilters } from '@/components/MovieFilters';

interface YearPageProps {
  params: {
    year: string;
  };
}

export default function YearPage({ params }: YearPageProps) {
  const {
    movies,
    loading,
    error,
    page,
    setPage,
    totalPages,
    refetch,
  } = useMovies({
    type: 'phim-moi-cap-nhat',
    filters: {
      year: parseInt(params.year),
    },
  });

  return (
    <main className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Phim Năm {params.year}</h1>

      <MovieList
        movies={movies}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </main>
  );
} 