import { Metadata } from "next";
import { api } from "@/lib/api";
import { MovieCard } from "@/components/movie-card";
import { Pagination } from "@/components/pagination";

export const metadata: Metadata = {
  title: "Phim Mới Cập Nhật - Xem Phim HD Vietsub",
  description: "Xem phim mới cập nhật, phim hay nhất, phim HD vietsub, thuyết minh, lồng tiếng chất lượng cao",
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function NewMoviesPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const { items: movies, pagination } = await api.getNewMovies(page);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Phim Mới Cập Nhật</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
        />
      )}
    </div>
  );
} 