import { Suspense } from 'react';
import { MovieGrid } from '@/components/movie-grid';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  };
}

async function fetchData(type: string, currentPage: number, itemsPerPage: number, searchParams: PageProps['searchParams']) {
  try {
    console.log(`Fetching movies for category type: ${type} with params:`, {
      page: currentPage,
      limit: itemsPerPage,
      country: searchParams?.country,
      year: searchParams?.year,
      sort_field: searchParams?.sort_field,
      sort_type: searchParams?.sort_type,
    });

    const [moviesResponse, categoriesResponse, genresResponse, countriesResponse] = await Promise.allSettled([
      api.getMoviesByCategory(type, {
        page: currentPage,
        limit: itemsPerPage,
        country: searchParams?.country,
        year: searchParams?.year ? Number(searchParams.year) : undefined,
        sort_field: searchParams?.sort_field as any,
        sort_type: searchParams?.sort_type as any,
      }),
      api.getCategories(),
      api.getGenres(),
      api.getCountries(),
    ]);

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
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = 20;

  const dataPromise = fetchData(type, currentPage, itemsPerPage, searchParams);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MovieListContent
        dataPromise={dataPromise}
        type={type}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        searchParams={searchParams}
      />
    </Suspense>
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
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Không tìm thấy thể loại</h2>
            <p className="text-gray-400 mb-6">{moviesResponse.value.msg || 'Thể loại bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'}</p>
            <Button asChild>
              <Link href="/">Về trang chủ</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const moviesData = moviesResponse.value.data;
  const movies = moviesData.items || [];
  const pagination = moviesData.params?.pagination || {
    totalItems: 0,
    totalItemsPerPage: itemsPerPage,
    currentPage,
    totalPages: 1,
  };

  const categories = categoriesResponse.status === 'fulfilled' ? categoriesResponse.value : [];
  const validGenres = genresResponse.status === 'fulfilled' ? genresResponse.value : [];
  const validCountries = countriesResponse.status === 'fulfilled' ? countriesResponse.value : [];

  // If no movies found but not an error, show empty state instead of 404
  if (movies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Không tìm thấy phim nào</h2>
            <p className="text-gray-400 mb-6">Xin lỗi, không có phim nào phù hợp với bộ lọc hiện tại.</p>
            <Button asChild>
              <Link href="/">Về trang chủ</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Get current category name for display
  const currentCategory = (Array.isArray(categories) ? categories.find(
    (cat: any) => cat.slug === type
  )?.name : '') || type.replace(/-/g, ' ');

  // Generate years for filter (last 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with filters */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-gray-800 rounded-lg p-4 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Bộ lọc</h2>
              
              {/* Country Filter */}
              <div className="mb-4">
                <h3 className="font-medium mb-2">Quốc gia</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {validCountries?.map((country: any) => (
                    <div key={country.slug} className="flex items-center">
                      <Link 
                        href={`/danh-sach/${type}?${new URLSearchParams({
                          ...searchParams,
                          country: country.slug,
                          page: '1', // Reset to first page when changing filters
                        })}`}
                        className={`text-sm hover:text-blue-400 ${searchParams?.country === country.slug ? 'text-blue-400 font-medium' : 'text-gray-300'}`}
                      >
                        {country.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Year Filter */}
              <div className="mb-4">
                <h3 className="font-medium mb-2">Năm phát hành</h3>
                <div className="grid grid-cols-2 gap-2">
                  {years.map((year) => (
                    <Link
                      key={year}
                      href={`/danh-sach/${type}?${new URLSearchParams({
                        ...searchParams,
                        year,
                        page: '1',
                      })}`}
                      className={`text-sm px-3 py-1 rounded ${searchParams?.year === year ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      {year}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {Object.keys(searchParams || {}).length > 0 && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                >
                  <Link href={`/danh-sach/${type}`}>
                    Xóa bộ lọc
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">
                {currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1).replace(/-/g, ' ')}
              </h1>
              
              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Sắp xếp:</span>
                <select
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
                  value={`${searchParams?.sort_field || '_id'}-${searchParams?.sort_type || 'desc'}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    const params = new URLSearchParams(searchParams as any);
                    params.set('sort_field', field);
                    params.set('sort_type', order);
                    window.location.href = `/danh-sach/${type}?${params.toString()}`;
                  }}
                >
                  <option value="_id-desc">Mới nhất</option>
                  <option value="year-desc">Năm mới nhất</option>
                  <option value="year-asc">Năm cũ nhất</option>
                  <option value="name-asc">Từ A-Z</option>
                  <option value="name-desc">Từ Z-A</option>
                </select>
              </div>
            </div>
            
            <Suspense fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array(10).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"></div>
                ))}
              </div>
            }>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {movies.map((movie: any) => (
                  <Link
                    key={movie._id}
                    href={`/phim/${movie.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                      <img
                        src={movie.thumb_url || '/placeholder.jpg'}
                        alt={movie.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
                      {movie.episode_current && (
                        <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {movie.episode_current}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {movie.name}
                    </h3>
                    <div className="flex items-center text-gray-400 text-xs mt-1">
                      <span>{movie.year}</span>
                      <span className="mx-1">•</span>
                      <span>{movie.quality}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {currentPage > 1 && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <Link
                        href={`/danh-sach/${type}?${new URLSearchParams({
                          ...searchParams,
                          page: (currentPage - 1).toString(),
                        })}`}
                        className="flex items-center"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Trước
                      </Link>
                    </Button>
                  )}
                  
                  <span className="flex items-center px-4 text-sm">
                    Trang {currentPage} / {pagination.totalPages}
                  </span>
                  
                  {currentPage < pagination.totalPages && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <Link
                        href={`/danh-sach/${type}?${new URLSearchParams({
                          ...searchParams,
                          page: (currentPage + 1).toString(),
                        })}`}
                        className="flex items-center"
                      >
                        Tiếp
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}