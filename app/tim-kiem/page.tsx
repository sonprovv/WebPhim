"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MovieList } from '@/components/MovieList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ChevronLeft } from 'lucide-react';
import { api, Movie } from '@/lib/api';
import { MovieCard } from '@/components/movie-card';

// Component con để lấy searchParams
function SearchParamsWrapper({ setKeyword }: { setKeyword: (value: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
  }, [searchParams, setKeyword]);

  return null;
}

export default function SearchPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState(keyword);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovies = async () => {
    if (!keyword) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await api.searchMovies(keyword, {
        page,
        limit: 20,
        sort_field: 'modified.time',
        sort_type: 'desc'
      });

      let cdnImageDomain = response.data.APP_DOMAIN_CDN_IMAGE;
      // Ensure cdnImageDomain has a protocol
      if (cdnImageDomain && !cdnImageDomain.startsWith('http://') && !cdnImageDomain.startsWith('https://')) {
        cdnImageDomain = `https://${cdnImageDomain}`;
      } else if (!cdnImageDomain) {
        // Fallback if APP_DOMAIN_CDN_IMAGE is empty
        cdnImageDomain = 'https://phimimg.com'; // Use a known default if API doesn't provide
      }

      const processedMovies = response.data.items.map(movie => ({
        ...movie,
        // Only prepend cdnImageDomain if poster_url/thumb_url are not already full URLs
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
  };

  useEffect(() => {
    if (keyword) {
      fetchMovies();
    }
  }, [keyword, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchQuery);
    setPage(1); // Reset về trang 1 khi tìm kiếm mới
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Đang tìm kiếm...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          <p>Có lỗi xảy ra khi tìm kiếm phim. Vui lòng thử lại sau.</p>
        </div>
      );
    }

    if (keyword && movies.length === 0) {
      return (
        <div className="text-center py-8">
          <p>Không tìm thấy phim nào phù hợp với từ khóa "{keyword}"</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie.slug} movie={movie} />
        ))}
      </div>
    );
  };

  return (
    <main className="container py-8 bg-gray-900 text-white pt-16">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="absolute left-4 top-4"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>
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
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Tìm kiếm
          </Button>
        </div>
      </form>

      <Suspense fallback={<div>Đang tải dữ liệu tìm kiếm...</div>}>
        <SearchParamsWrapper setKeyword={setKeyword} />
        {keyword && renderContent()}
      </Suspense>
    </main>
  );
}