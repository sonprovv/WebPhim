import { Suspense } from 'react';
import { MovieGrid } from '@/components/movie-grid';
import { Sidebar, FilterItem } from '@/components/sidebar';
import { Header } from '@/components/header';
import { api, MOVIE_TYPES } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Movie {
  id: string;
  name: string;
  slug: string;
  origin_name: string;
  poster_url: string;
  thumb_url: string;
  time: string;
  quality: string;
  year: number;
  country: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Country {
  id: string;
  name: string;
  slug: string;
}

interface PageProps {
  params: {
    type: string;
  };
  searchParams?: {
    page?: string;
    country?: string;
    year?: string;
    sort_field?: string;
    sort_type?: string;
    sort_lang?: string;
  };
}

interface MovieListParams {
  page?: number;
  limit?: number;
  sort_field?: 'year' | 'modified.time' | '_id';
  sort_type?: 'asc' | 'desc';
  sort_lang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
  country?: string;
  year?: number;
}

async function fetchData(type: string, currentPage: number, itemsPerPage: number, searchParams: PageProps['searchParams']) {
  try {
    const params: MovieListParams = {
      page: currentPage,
      limit: itemsPerPage,
      sort_field: (searchParams?.sort_field as 'year' | 'modified.time' | '_id') || '_id',
      sort_type: searchParams?.sort_type as 'asc' | 'desc',
      sort_lang: searchParams?.sort_lang as 'vietsub' | 'thuyet-minh' | 'long-tieng',
      country: searchParams?.country,
      year: searchParams?.year ? Number(searchParams.year) : undefined,
    };

    // console.log(`Fetching movies for type: ${type} with params:`, params);

    const [moviesResponse, categoriesResponse, genresResponse, countriesResponse] = await Promise.allSettled([
      api.getMovieList(type as any, params),
      api.getCategories(),
      api.getGenres(),
      api.getCountries(),
    ]);

    // console.log('Movies Response:', {
    //   status: moviesResponse.status,
    //   value: moviesResponse.status === 'fulfilled' ? {
    //     status: moviesResponse.value?.status,
    //     msg: moviesResponse.value?.msg,
    //     data: moviesResponse.value?.data ? {
    //       items: moviesResponse.value.data.items?.length,
    //       params: moviesResponse.value.data.params,
    //       APP_DOMAIN_CDN_IMAGE: moviesResponse.value.data.APP_DOMAIN_CDN_IMAGE,
    //     } : null,
    //   } : moviesResponse.reason,
    // });

    if (moviesResponse.status === 'rejected') {
      console.error('Error fetching movies:', moviesResponse.reason);
      throw new Error('Failed to fetch movies');
    }

    if (!moviesResponse.value || moviesResponse.value.status === 'error') {
      console.error('API returned an error:', moviesResponse.value?.msg);
      throw new Error(moviesResponse.value?.msg || 'Failed to fetch movies');
    }

    return {
      moviesResponse,
      categoriesResponse,
      genresResponse,
      countriesResponse,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export default function MovieListPage({
  params,
  searchParams = {},
}: PageProps) {
  const { type } = params;
  // console.log(`[MovieListPage] Received type param: ${type}`);
  
  // Validate movie type
  if (!MOVIE_TYPES.includes(type as any)) {
    console.error(`Invalid movie type: ${type}`);
    return notFound();
  }

  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = 20;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2">Đang tải...</span>
          </div>
        }>
          <MovieListContent
            dataPromise={fetchData(type, currentPage, itemsPerPage, searchParams)}
            type={type}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            searchParams={searchParams}
          />
        </Suspense>
      </main>
    </div>
  );
}

interface MovieListContentProps {
  dataPromise: Promise<{
    moviesResponse: PromiseSettledResult<any>;
    categoriesResponse: PromiseSettledResult<any>;
    genresResponse: PromiseSettledResult<any>;
    countriesResponse: PromiseSettledResult<any>;
  }>;
  type: string;
  currentPage: number;
  itemsPerPage: number;
  searchParams: PageProps['searchParams'];
}

async function MovieListContent({
  dataPromise,
  type,
  currentPage,
  itemsPerPage,
  searchParams,
}: MovieListContentProps) {
  try {
    const { moviesResponse, categoriesResponse, genresResponse, countriesResponse } = await dataPromise;

    // Handle API responses
    if (moviesResponse.status === 'rejected' || !moviesResponse.value) {
      console.error('Error fetching movies:', moviesResponse.status === 'rejected' ? moviesResponse.reason : 'No data');
      return notFound();
    }

    // Check if the API returned an error response
    if (moviesResponse.value.status === 'error') {
      console.error('API returned an error:', moviesResponse.value.msg);
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy thể loại</h2>
          <p className="text-gray-400 mb-6">{moviesResponse.value.msg || 'Thể loại bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'}</p>
          <Button asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      );
    }

    const moviesData = moviesResponse.value.data;
    if (!moviesData || !moviesData.items) {
      console.error('Invalid API response structure:', moviesResponse.value);
      return notFound();
    }

    // Process image URLs
    const cdnImageDomain = moviesData.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com';
    const movies = moviesData.items.map((movie: Movie) => ({
      ...movie,
      poster_url: movie.poster_url
        ? (movie.poster_url.startsWith('http') ? movie.poster_url : `${cdnImageDomain}/${movie.poster_url}`.replace(/([^:]\/)\/+/g, '$1'))
        : '/placeholder.jpg',
      thumb_url: movie.thumb_url
        ? (movie.thumb_url.startsWith('http') ? movie.thumb_url : `${cdnImageDomain}/${movie.thumb_url}`.replace(/([^:]\/)\/+/g, '$1'))
        : '/placeholder.jpg',
    }));

    const pagination = moviesData.params?.pagination || {
      totalItems: 0,
      totalItemsPerPage: itemsPerPage,
      currentPage,
      totalPages: 1,
    };

    // Convert categories, genres, and countries to FilterItem format
    const categories = categoriesResponse.status === 'fulfilled' 
      ? categoriesResponse.value.map((cat: Category) => ({
          id: cat.id,
          name: cat.name,
          count: 0,
        }))
      : [];

    const genres = genresResponse.status === 'fulfilled'
      ? genresResponse.value.map((genre: Category) => ({
          id: genre.id,
          name: genre.name,
          count: 0,
        }))
      : [];

    const countries = countriesResponse.status === 'fulfilled'
      ? countriesResponse.value.map((country: Country) => ({
          id: country.id,
          name: country.name,
          count: 0,
        }))
      : [];

    // Generate years for filter (last 10 years)
    const currentYear = new Date().getFullYear();
    const years: FilterItem[] = Array.from({ length: 10 }, (_, i) => ({
      id: (currentYear - i).toString(),
      name: (currentYear - i).toString(),
      count: 0,
    }));

    // If no movies found but not an error, show empty state instead of 404
    if (movies.length === 0) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy phim nào</h2>
          <p className="text-gray-400 mb-6">Xin lỗi, không có phim nào phù hợp với bộ lọc hiện tại.</p>
          <Button asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      );
    }

    // Get current category name for display
    const currentCategory = type === 'phim-bo' ? 'Phim Bộ' :
                            type === 'tv-shows' ? 'TV Shows' :
                           type === 'phim-le' ? 'Phim Lẻ' :
                           type === 'hoat-hinh' ? 'Hoạt Hình' :
                           type === 'tinh-cam' ? 'Tình Cảm' :
                           type == 'chinh-kich' ? 'Chính Kịch':
                           type == 'tam-ly' ? 'Tâm Lý' :
                           type == 'hinh-su' ? 'Hình Sự' :
                           type == 'co-trang' ? 'Cổ Trang' :
                           type.replace(/-/g, ' ');

    return (
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4 text-white">Thể loại: {currentCategory}</h1>
            <MovieGrid movies={movies} />
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {currentPage > 1 && (
                <Button asChild variant="outline" className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700">
                  <Link
                    href={{
                      pathname: `/danh-sach/${type}`,
                      query: { ...searchParams, page: currentPage - 1 },
                    }}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Trang trước
                  </Link>
                </Button>
              )}
              <div className="flex items-center px-4 py-2 bg-blue-600 rounded-md">
                <span className="text-sm font-medium text-white">
                  Trang {currentPage}/{pagination.totalPages}
                </span>
              </div>
              {currentPage < pagination.totalPages && (
                <Button asChild variant="outline" className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700">
                  <Link
                    href={{
                      pathname: `/danh-sach/${type}`,
                      query: { ...searchParams, page: currentPage + 1 },
                    }}
                  >
                    Trang sau
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in MovieListContent:', error);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h2>
        <p className="text-gray-400 mb-6">Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</p>
        <Button asChild>
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    );
  }
}