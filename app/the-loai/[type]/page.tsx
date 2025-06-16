'use client';

import { useMovies } from '@/hooks/useMovies';
import { MovieList } from '@/components/MovieList';
import { MovieFilters } from '@/components/MovieFilters';

interface CategoryPageProps {
  params: {
    type: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const {
    movies,
    loading,
    error,
    page,
    setPage,
    totalPages,
    refetch,
  } = useMovies({
    type: params.type,
  });

  return (
    <main className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">
        Danh Sách Phim
      </h1>

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