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
  movie: {
    _id: string;
    name: string;
    poster_url?: string;
    [key: string]: any;
  };
  episodes: {
    server_name: string;
    server_data: Episode[];
  }[];
}

export function Player({ 
  movie,
  episodes = [], 
  className = ''
}: PlayerProps) {
  // Find the current episode based on URL
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
      return episodes[0].server_data[0].link_m3u8 || episodes[0].server_data[0].link_embed;
    }
    
    // Otherwise try to use the current episode's m3u8 or embed URL
    if (currentEpisode) {
      return currentEpisode.link_m3u8 || currentEpisode.link_embed;
    }
    
    // Fallback to first available source
    if (availableSources.length > 0) {
      const source = availableSources[0];
      return source.link_m3u8 || source.link_embed;
    }
    
    return '';
  })();
  
  // Use poster from movie
  const posterUrl = movie?.poster_url;

  if (!videoUrl) {
    return (
      <Card className={`w-full h-full flex items-center justify-center bg-black ${className || ''}`}>
        <div className="text-center text-white p-4">
          <p>Không tìm thấy nguồn phát video</p>
          <p className="text-sm text-gray-400 mt-2">Vui lòng thử lại hoặc chọn tập khác</p>
        </div>
      </Card>
    );
  }

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
