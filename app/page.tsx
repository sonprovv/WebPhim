import { Suspense } from 'react';
import { MovieGrid } from "@/components/movie-grid";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { SidebarProvider } from "@/components/sidebar-context";
import { getLatestMovies, getGenres, getCountries } from "@/lib/api";

export default async function HomePage() {
  const moviesResponse = await getLatestMovies({
    page: 1,
    limit: 20
  });
  const newMovies = moviesResponse.data?.items || [];

  const genres = await getGenres();
  const countries = await getCountries();

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { id: year.toString(), name: year.toString(), count: 0 };
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <section>
            <h2 className="text-3xl font-bold mb-6">Phim Mới Cập Nhật</h2>
            <Suspense fallback={<div className="h-96 bg-gray-800 animate-pulse rounded-lg">Loading...</div>}>
              <MovieGrid movies={newMovies} />
            </Suspense>
          </section>
        </div>
        
      </div>
    </SidebarProvider>
  );
}