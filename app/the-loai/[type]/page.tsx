'use client';

import { useMovies } from '@/hooks/useMovies';
import { MovieList } from '@/components/MovieList';
// import { MovieFilters } from '@/components/MovieFilters'; // Remove if not used

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
    fetchType: 'category', // Specify that we are fetching by category
  });

  return (
    <main className="container py-8 bg-gray-900 text-white pt-16">
      <h1 className="mb-8 text-3xl font-bold">
        Thể loại: {params.type.replace(/-/g, ' ').toUpperCase()}
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