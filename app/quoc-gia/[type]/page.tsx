'use client';

import { useMovies } from '@/hooks/useMovies';
import { MovieList } from '@/components/MovieList';
import { MovieFilters } from '@/components/MovieFilters';

interface CountryPageProps {
  params: {
    type: string;
  };
}

export default function CountryPage({ params }: CountryPageProps) {
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
    type: params.type,
  });

  const country = countries.find((c) => c.slug === params.type);

  return (
    <main className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {country ? `Phim ${country.name}` : 'Danh Sách Phim'}
      </h1>

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