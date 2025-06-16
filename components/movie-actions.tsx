'use client';

import { Button } from "@/components/ui/button";
import { Play, Share2 } from "lucide-react";
import Link from "next/link";

interface MovieActionsProps {
  movie: {
    name: string;
    slug: string;
    poster_url?: string;
  };
  episodes?: {
    server_name: string;
    server_data: {
      name: string;
      slug: string;
      filename: string;
      link_embed: string;
      link_m3u8: string;
    }[];
  }[];
}

export function MovieActions({ movie, episodes }: MovieActionsProps) {
  console.log('Movie slug:', movie.slug);
  return (
    <div className="flex space-x-4 mb-6">
      <Link href={`/phim/${movie.slug}/xem`}>
        <Button 
          size="lg" 
          className="bg-red-600 hover:bg-red-700"
        >
          <Play className="w-5 h-5 mr-2" />
          Xem Phim
        </Button>
      </Link>
      <Button 
        variant="outline" 
        size="lg" 
        className="border-gray-600 text-gray-300 hover:bg-gray-700"
      >
        <Share2 className="w-5 h-5 mr-2" />
        Chia Sẻ
      </Button>
    </div>
  );
}
