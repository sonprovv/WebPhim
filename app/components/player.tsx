'use client';

import { useParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { HLSPlayer } from "./hls-player";

interface Episode {
  name: string;
  slug: string;
  link_embed: string;
  link_m3u8: string;
  filename?: string;
}

import { HTMLAttributes } from 'react';

interface PlayerProps extends HTMLAttributes<HTMLDivElement> {
  // Either use movie with episodes
  movie?: {
    _id: string;
    name: string;
    poster_url?: string;
    [key: string]: any;
  };
  episodes?: {
    server_name: string;
    server_data: Episode[];
  }[];
  
  // Or use direct URL and poster
  url?: string;
  poster?: string;
}

export function Player({ 
  movie,
  episodes = [], 
  className = '',
  url,
  poster
}: PlayerProps) {
  // If direct URL is provided, use that
  if (url) {
    return (
      <div className={className}>
        <HLSPlayer 
          src={url} 
          poster={poster} 
          className="w-full h-full"
          autoPlay
          controls
        />
      </div>
    );
  }

  // Otherwise, use the movie/episodes logic
  const { episode: episodeSlug } = useParams() as { episode?: string };
  
  // Get all available video sources
  const availableSources: Episode[] = (() => {
    if (!episodes?.[0]?.server_data) return [];
    return episodes[0].server_data;
  })();
  
  // Find the current episode based on URL slug or use the first one
  const currentEpisode: Episode | undefined = (() => {
    // Try to find by slug first
    if (episodeSlug) {
      const found = availableSources.find(ep => ep.slug === episodeSlug);
      if (found) return found;
    }
    
    // Fallback to first episode
    return availableSources[0];
  })();

  // Get the first available video source
  const videoUrl = (() => {
    // Try to get URL from the first server's first episode
    if (episodes?.[0]?.server_data?.[0]) {
      const source = episodes[0].server_data[0];
      // Prefer m3u8 over embed URL
      return source.link_m3u8 || source.link_embed;
    }
    
    // Otherwise try to use the current episode's m3u8 or embed URL
    if (currentEpisode) {
      // Prefer m3u8 over embed URL
      return currentEpisode.link_m3u8 || currentEpisode.link_embed;
    }
    
    // Fallback to first available source
    if (availableSources.length > 0) {
      const source = availableSources[0];
      // Prefer m3u8 over embed URL
      return source.link_m3u8 || source.link_embed;
    }
    
    return '';
  })();
  
  // Validate video URL
  const isValidVideoUrl = (url: string) => {
    if (!url) return false;
    // Check if URL is valid
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!videoUrl || !isValidVideoUrl(videoUrl)) {
    return (
      <Card className={`w-full h-full flex items-center justify-center bg-black ${className || ''}`}>
        <div className="text-center text-white p-4">
          <p>Không tìm thấy nguồn phát video hợp lệ</p>
          <p className="text-sm text-gray-400 mt-2">Vui lòng thử lại hoặc chọn tập khác</p>
        </div>
      </Card>
    );
  }

  // Use poster from movie
  const posterUrl = movie?.poster_url;

  const cardClassName = `w-full overflow-hidden bg-black ${className || ''}`;
  
  return (
    <Card className={cardClassName}>
      {!videoUrl && (
        <div className="flex items-center justify-center h-full min-h-[400px] text-white">
          <p>Loading video...</p>
        </div>
      )}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <HLSPlayer 
          src={videoUrl}
          poster={posterUrl}
          autoPlay
          controls
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </Card>
  )
}
