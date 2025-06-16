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
    filters,
    updateFilters,
    categories,
    countries,
  } = useMovies({
    type: 'phim-moi-cap-nhat',
    initialFilters: {
      year: parseInt(params.year),
    },
  });

  return (
    <main className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Phim Năm {params.year}</h1>

      <div className="mb-8">
        <MovieFilters
          categories={categories}
          countries={countries}
          filters={filters}
          onFilterChange={updateFilters}
        />
      </div>

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