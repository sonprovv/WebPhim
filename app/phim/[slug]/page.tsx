'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { Movie } from '@/lib/api';
import Image from 'next/image';
import { Calendar, Globe, Clock, Star, ArrowLeft } from 'lucide-react';
import { EpisodeList } from '@/components/episode-list';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

interface Server {
  server_name: string;
  server_data: Episode[];
}

interface Episode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

// This is the main page component
export default function MovieDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const router = useRouter();
  const [movieData, setMovieData] = useState<{ movie: Movie; episodes: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMovieData = async () => {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await api.getMovieDetail(slug);
        
        if (isMounted) {
          if (!data.status) {
            throw new Error(data.msg || 'Không tìm thấy phim');
          }

          setMovieData({
            movie: data.movie,
            episodes: data.episodes || []
          });
        }
      } catch (err: any) {
        console.error('Lỗi khi tải chi tiết phim:', err);
        if (isMounted) {
          setError(err.message || 'Có lỗi xảy ra khi tải thông tin phim');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMovieData();
    
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Lỗi</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Handle case when slug is not available
  if (!slug) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Lỗi</h2>
          <p className="mb-4">Không tìm thấy thông tin phim</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!movieData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Không tìm thấy thông tin phim</p>
      </div>
    );
  }

  const { movie, episodes } = movieData;

  // Kiểm tra và làm sạch poster_url để tránh gửi request đến google.com
  const safePosterUrl = movie.poster_url?.startsWith('http') && !movie.poster_url.includes('google.com')
    ? movie.poster_url
    : '/placeholder-poster.jpg';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="relative aspect-video bg-black">
                <Image
                  src={safePosterUrl}
                  alt={movie.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">{movie.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    <span>{movie.year || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>{(movie as any).country?.[0]?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span>{(movie as any).time || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-red-400" />
                    <span>{(movie as any).view || 0} lượt xem</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {(movie as any).category?.map((cat: any) => (
                    <span key={cat.id} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                      {cat.name}
                    </span>
                  ))}
                </div>

                <div className="prose prose-invert max-w-none">
                  <p>{movie.content || 'Không có mô tả.'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Server Selection
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Server</h2>
              <div className="space-y-2">
                {episodes?.length > 0 ? (
                  <EpisodeList 
                    episodes={episodes} 
                    movieSlug={slug}
                    itemsPerPage={10}
                  />
                ) : (
                  <p className="text-gray-400">Đang tải danh sách server...</p>
                )}
              </div>
            </div>
          </div> */}

          {/* Danh sách tập phim */}
          {movieData.episodes && movieData.episodes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Danh sách tập</h2>
              <EpisodeList 
                episodes={movieData.episodes} 
                movieSlug={slug} 
                currentEpisode={null}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
