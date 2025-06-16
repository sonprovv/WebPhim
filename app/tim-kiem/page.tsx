'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMovies } from '@/hooks/useMovies';
import { MovieList } from '@/components/MovieList';
import { MovieFilters } from '@/components/MovieFilters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [searchQuery, setSearchQuery] = useState(keyword);

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
    searchMovies,
  } = useMovies();

  useEffect(() => {
    if (keyword) {
      searchMovies(keyword);
    }
  }, [keyword, searchMovies]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchQuery);
  };

  return (
    <main className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Tìm Kiếm Phim</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Nhập tên phim cần tìm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Tìm kiếm
          </Button>
        </div>
      </form>

      {keyword && (
        <>
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
        </>
      )}
    </main>
  );
}
