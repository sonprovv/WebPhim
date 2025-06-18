"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { VideoPlayer } from "@/components/video-player";
import { MovieCard } from "@/components/movie-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

interface Movie {
  id: string;
  name: string;
  origin_name: string;
  content?: string;
  type?: string;
  status?: string;
  thumb_url: string;
  poster_url: string;
  is_copyright?: boolean;
  sub_docquyen?: boolean;
  chieurap?: boolean;
  trailer_url?: string;
  time?: string;
  episode_current?: string;
  episode_total?: string;
  quality?: string;
  lang?: string;
  notify?: string;
  showtimes?: string;
  slug: string;
  year: number;
  view?: number;
  actor?: string[];
  director?: string[];
  category?: { id: string; name: string; slug: string }[];
  country?: { id: string; name: string; slug: string }[];
  episodes?: Server[];
  modified?: {
    time: string;
  };
  tmdb?: {
    type: string | null;
    id: string | null;
    season: number | null;
    vote_average: number;
    vote_count: number;
  };
  imdb?: {
    id: string | null;
  };
}

interface MovieDetailResponse {
  status: boolean;
  msg: string;
  movie: Movie;
  episodes: Server[];
}

interface MoviesResponse {
  status: string | boolean;
  msg: string;
  data: {
    items: Movie[];
    params: {
      pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        totalPages: number;
      };
    };
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const { slug, episode } = params as { slug: string; episode?: string };

  const [movie, setMovie] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<Server[]>([]);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch movie detail
        const data = await api.getMovieDetail(slug);
        if (!data.status) {
          throw new Error(data.msg || "Không tìm thấy phim");
        }
        const { movie: fetchedMovie, episodes: fetchedEpisodes } = data;
        setMovie(fetchedMovie);
        setEpisodes(fetchedEpisodes);

        // Fetch related movies
        const relatedPromises = fetchedMovie.category?.map((cat) =>
          api.getMoviesByCategory(cat.slug, { limit: 5 })
        ) || [];
        const relatedResponses = await Promise.all(relatedPromises);
        const allRelatedMovies = relatedResponses
          .flatMap((res) => res.data?.items || [])
          .filter((m) => m.slug !== slug);
        setRelatedMovies(allRelatedMovies.slice(0, 5)); // Lấy tối đa 5 phim liên quan
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu WatchPage:", err);
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="h-48 bg-gray-800 animate-pulse rounded-lg w-full max-w-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-red-400">Không tìm thấy phim</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-300 hover:text-white"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>
        <VideoPlayer 
          movie={movie}
          episodes={episodes}
          className="aspect-video w-full"
        />

        {/* Danh sách phim liên quan */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Phim Liên Quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedMovies.map((movie) => (
              <MovieCard key={movie.slug} movie={movie} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}