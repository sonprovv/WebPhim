"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMovies } from '@/hooks/useMovies';
import { MovieList } from '@/components/MovieList';
import { MovieFilters } from '@/components/MovieFilters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

// Component con để lấy searchParams
function SearchParamsWrapper({ setKeyword }: { setKeyword: (value: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
  }, [searchParams, setKeyword]);

  return null;
}

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState(keyword);

  const {
    movies,
    loading,
    error,
    page,
    setPage,
    totalPages,
    refetch,
  } = useMovies();

  useEffect(() => {
    if (keyword) {
      refetch();
    }
  }, [keyword, refetch]);

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

      <Suspense fallback={<div>Đang tải dữ liệu tìm kiếm...</div>}>
        <SearchParamsWrapper setKeyword={setKeyword} />
        {keyword && (
          <>
            {/* <div className="mb-8">
              <MovieFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div> */}

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
      </Suspense>
    </main>
  );
}