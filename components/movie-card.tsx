'use client';

import Image from "next/image"
import Link from "next/link"
import { Movie } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { useState } from 'react';

// Helper function to validate and format URL
const getImageUrl = (url?: string): string => {
  if (!url) return '/placeholder.jpg';
  return url;
};

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(movie.poster_url || movie.thumb_url);
  
  // If there was an error, show placeholder
  if (imageError) {
    return (
      <Link href={`/phim/${movie.slug}`}>
        <div className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No image available</span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
            <h3 className="text-white font-semibold line-clamp-2">{movie.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-blue-600 hover:bg-blue-700">
                {movie.year}
              </Badge>
              {movie.quality && (
                <Badge variant="secondary" className="bg-green-600 hover:bg-green-700">
                  {movie.quality}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/phim/${movie.slug}`}>
      <div className="group relative aspect-[2/3] rounded-lg overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt={movie.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
            unoptimized // Add this to bypass Next.js image optimization
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold line-clamp-2">{movie.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-blue-600 hover:bg-blue-700">
                {movie.year}
              </Badge>
              {movie.quality && (
                <Badge variant="secondary" className="bg-green-600 hover:bg-green-700">
                  {movie.quality}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
