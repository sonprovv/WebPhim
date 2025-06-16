"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Header } from "@/components/header";
import { Player } from "@/app/components/player";
import { Movie } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { slug, episode } = params as { slug: string; episode: string };
  const episodeNumber = parseInt(episode.replace("tap-", "") || "1");

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<string>(episode); // Sử dụng string cho slug
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // Thêm state cho video URL
  const [episodes, setEpisodes] = useState<any[]>([]); // Cần thay bằng interface Server nếu có
  const serverIndex = parseInt(searchParams.get("server") || "0");

  // Get current server's episodes
  const currentServerEpisodes = episodes[serverIndex]?.server_data || [];

  // Find current episode data
  const currentEpisodeData =
    currentServerEpisodes.find((ep: any) => ep.slug === currentEpisode) ||
    currentServerEpisodes[0];

  // Lấy link_embed cho iframe
  const embedUrl = currentEpisodeData?.link_embed;

  // Handle episode change
  const handleEpisodeChange = useCallback(
    (newEpisodeSlug: string) => {
      router.push(`/phim/${slug}/xem/${newEpisodeSlug}`);
    },
    [router, slug]
  );

  // Handle server change
  const handleServerChange = (index: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("server", index.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  // Handle episode selection
  const handleEpisodeSelect = (newEpisodeSlug: string) => {
    setCurrentEpisode(newEpisodeSlug);
    handleEpisodeChange(newEpisodeSlug);
  };

  // Handle retry
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.getMovieDetail(slug);

        if (!data.status) {
          throw new Error(data.msg || "Không tìm thấy phim");
        }

        setMovie(data.movie);

        if (data.episodes && data.episodes.length > 0) {
          setEpisodes(data.episodes);

          // Get current server's episodes
          const currentServer = data.episodes[serverIndex] || data.episodes[0];
          const serverEpisodes = currentServer.server_data || [];

          // Find the requested episode or use the first one
          const episodeData =
            serverEpisodes.find((ep: any) => ep.slug === episode) ||
            serverEpisodes[0];

          if (!episodeData) {
            throw new Error("Không tìm thấy tập phim");
          }

          // Update URL if we had to redirect to first episode
          if (episodeData.slug !== episode) {
            router.replace(`/phim/${slug}/xem/${episodeData.slug}`);
          }

          // Set video URL
          const videoSource = episodeData.link_m3u8 || episodeData.link_embed;
          setVideoUrl(videoSource);
          setCurrentEpisode(episodeData.slug);
        } else {
          throw new Error("Phim chưa có tập nào");
        }
      } catch (err: any) {
        console.error("Lỗi khi tải dữ liệu phim:", err);
        setError(err.message || "Có lỗi xảy ra khi tải thông tin phim");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchMovieData();
    }
  }, [slug, episode, serverIndex, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="container mx-auto p-4">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-lg">Đang tải dữ liệu phim...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="container mx-auto p-4">
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-400 mb-2">
              {error || "Đã xảy ra lỗi khi tải phim"}
            </h2>
            <p className="text-gray-300 mb-6">
              Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu lỗi vẫn tiếp diễn.
            </p>
            <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700 text-white">
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2">{movie.name}</h1>

        {/* Server selection */}
        {episodes.length > 1 && (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Chọn máy chủ:</h3>
            <div className="flex flex-wrap gap-2">
              {episodes.map((server, index) => (
                <Button
                  key={index}
                  variant={index === serverIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleServerChange(index)}
                  className="text-sm"
                >
                  {server.server_name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Player */}
        {embedUrl ? (
          <div className="mb-6">
            <iframe
              src={embedUrl}
              width="100%"
              height="500"
              allowFullScreen
              frameBorder="0"
              style={{ borderRadius: 8, background: '#000' }}
              title="Phim Player"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-center p-6 space-y-4">
            <div className="text-red-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="font-medium">Không tìm thấy nguồn phát</p>
            </div>
            <p className="text-gray-400">Vui lòng thử lại sau hoặc liên hệ quản trị viên</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors text-sm"
            >
              Tải lại trang
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Danh sách tập</h2>
              <div className="space-y-4">
                {episodes.map((server, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{server.server_name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {server.server_data.map((ep: any) => (
                        <button
                          key={ep.slug}
                          onClick={() => handleEpisodeSelect(ep.slug)}
                          className={`px-3 py-1 rounded-md ${
                            currentEpisode === ep.slug
                              ? "bg-blue-600 text-white"
                              : "bg-gray-600 hover:bg-gray-500"
                          }`}
                        >
                          {ep.name || `Tập ${ep.slug.split("-").pop() || server.server_data.indexOf(ep) + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Thông tin phim</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Tên gốc:</h3>
                  <p className="text-gray-300">{movie.origin_name || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Năm phát hành:</h3>
                  <p className="text-gray-300">{movie.year || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Quốc gia:</h3>
                  <p className="text-gray-300">
                    {movie.country?.map((c: any) => c.name).join(", ") || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Thể loại:</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {movie.category?.map((cat: any) => (
                      <span
                        key={cat.id}
                        className="px-2 py-1 bg-gray-700 rounded-md text-sm"
                      >
                        {cat.name}
                      </span>
                    )) || <span className="text-gray-300">N/A</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}