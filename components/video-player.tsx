'use client';

import { Card } from "@/components/ui/card";
import { HLSPlayer } from "./hls-player"; // Make sure this file exists in the same directory

interface Episode {
  name: string;
  slug: string;
  link_embed: string;
  link_m3u8: string;
  filename?: string;
}

interface VideoPlayerProps {
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
  className?: string;
}

export function VideoPlayer({ 
  movie,
  episodes = [], 
  className = '' 
}: VideoPlayerProps) {
  // Get the first available video source
  const videoUrl = episodes?.[0]?.server_data?.[0]?.link_m3u8 || 
                  episodes?.[0]?.server_data?.[0]?.link_embed || '';

  if (!videoUrl) {
    return (
      <Card className={`w-full overflow-hidden bg-black ${className}`}>
        <div className="flex items-center justify-center h-full min-h-[400px] text-white">
          <p>No video source available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`w-full overflow-hidden bg-black ${className}`}>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <HLSPlayer 
          src={videoUrl}
          poster={movie?.poster_url}
          autoPlay
          controls
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </Card>
  );
}
