import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/lib/api';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/phim/${movie.slug}`} className="group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
        <Image
          src={movie.poster_url}
          alt={movie.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <h3 className="text-lg font-semibold line-clamp-2">{movie.name}</h3>
          <p className="text-sm text-gray-200">{movie.origin_name}</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="rounded bg-primary px-2 py-1">{movie.year}</span>
            <span className="rounded bg-primary/80 px-2 py-1">{movie.quality}</span>
          </div>
        </div>
      </div>
    </Link>
  );
} 