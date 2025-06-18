import { Suspense } from 'react';
import { MovieGrid } from '@/components/movie-grid';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Pagination } from "@/components/pagination";

interface PageProps {
  params: {
    type: string;
  };
  searchParams: {
    page?: string;
    sort_field?: string;
    sort_type?: string;
    sort_lang?: string;
  };
}

async function fetchData(type: string, searchParams: PageProps['searchParams']) {
  try {
    const params = {
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      sort_field: searchParams.sort_field || '_id',
      sort_type: searchParams.sort_type as 'asc' | 'desc',
      sort_lang: searchParams.sort_lang,
    };

    // //console.log(`Fetching movies for genre: ${type} with params:`, params);

    const [moviesResponse, categoriesResponse, genresResponse] = await Promise.allSettled([
      api.getMoviesByGenre(type, params),
      api.getCategories(),
      api.getGenres(),
      // api.getCountries(),
    ]);

    if (moviesResponse.status === 'rejected') {
      //console.error('Error fetching movies:', moviesResponse.reason);
      throw new Error('Failed to fetch movies');
    }

    if (!moviesResponse.value || moviesResponse.value.status === 'error') {
      //console.error('API returned an error:', moviesResponse.value?.msg);
      throw new Error(moviesResponse.value?.msg || 'Failed to fetch movies');
    }

    return {
      moviesResponse,
      categoriesResponse,
      genresResponse,
      // countriesResponse,
    };
  } catch (error) {
    //console.error('Error fetching data:', error);
    throw error;
  }
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const dataPromise = fetchData(params.type, searchParams);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <MovieListContent
            dataPromise={dataPromise}
            type={params.type}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </div>
  );
}

interface MovieListContentProps {
  dataPromise: Promise<{
    moviesResponse: PromiseSettledResult<any>;
    categoriesResponse: PromiseSettledResult<any>;
    genresResponse: PromiseSettledResult<any>;
    // countriesResponse: PromiseSettledResult<any>;
  }>;
  type: string;
  searchParams: PageProps['searchParams'];
}

async function MovieListContent({
  dataPromise,
  type,
  searchParams,
}: MovieListContentProps) {
  try {
    const { moviesResponse, categoriesResponse, genresResponse } = await dataPromise;

    if (moviesResponse.status === 'rejected' || !moviesResponse.value) {
      //console.error('Error fetching movies:', moviesResponse.status === 'rejected' ? moviesResponse.reason : 'No data');
      return notFound();
    }

    if (moviesResponse.value.status === 'error') {
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
      //console.error('Invalid API response structure:', moviesResponse.value);
      return notFound();
    }

    const currentPage = parseInt(searchParams.page || '1');
    const totalPages = moviesData.params.pagination.totalPages;
    const currentType = type === 'tinh-cam' ? 'Tình Cảm' :
                        type == 'chinh-kich' ? 'Chính Kịch':
                        type == 'tam-ly' ? 'Tâm Lý' :
                        type == 'hinh-su' ? 'Hình Sự' :
                        type == 'co-trang' ? 'Cổ Trang' :
                        type === 'hanh-dong' ? 'Hành Động' :
                        type == 'mien-tay' ? 'Miền Tây':
                        type == 'tre-em' ? 'Trẻ Em' :
                        type == 'lich-su' ? 'Lịch Sử' :
                        type == 'chien-tranh' ? 'Chiến Tranh' :
                        type == 'vien-tuong' ? 'Viễn Tưởng' :
                        type === 'kinh-di' ? 'kinh Dị' :
                        type == 'tai-lieu' ? 'Tài Liệu':
                        type == 'bi-an' ? 'Bí Ẩn' :
                        type == 'the-thao' ? 'Thể Thao' :
                        type == 'phieu-luu' ? 'Phiêu Lưu' :
                        type == 'am-nhac' ? 'Âm nhạc' :
                        type == 'gia-dinh' ? 'Gia Đình' :
                        type == 'hoc-duong' ? 'Học Đường' :
                        type === 'hai-huoc' ? 'Hài Hước' :
                        type == 'vo-thuat' ? 'Võ Thuật':
                        type == 'khoa-hoc' ? 'Khoa Học' :
                        type == 'than-thoai' ? 'Thần Thoại' :
                        type == 'kinh-dien' ? 'Kinh Điển' :
                        type.replace(/-/g, ' ');
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-8">
            {currentType}
          </h1>
          
          <MovieGrid movies={moviesData.items} />

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          )}
        </div>

        
      </div>
    );
  } catch (error) {
    //console.error('Error in MovieListContent:', error);
    return notFound();
  }
} 