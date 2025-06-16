import { Suspense } from 'react';
import { MovieGrid } from "@/components/movie-grid";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { api } from "@/lib/api";
import type { FilterItem } from "@/components/sidebar";
import Link from 'next/link';

export default async function MovieListPage() {
  try {
    const categories = await api.getCategories();
    const genres = await api.getGenres();
    const countries = await api.getCountries();
    
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <section>
            <h2 className="text-3xl font-bold mb-6">Danh Sách Thể Loại Phim</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                  <Link href={`/danh-sach/${category.slug}`} className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gray-700 mb-3 flex items-center justify-center">
                      <span className="text-xl font-bold">{category.name[0]}</span>
                    </div>
                    <h3 className="text-lg font-semibold mt-2">{category.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{category.description}</p>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>
        <Sidebar 
          className="hidden lg:block w-64"
          genres={genres.map(genre => ({ ...genre, count: 0 } as FilterItem))}
          countries={countries.map(country => ({ ...country, count: 0 } as FilterItem))}
          years={[]} // Add empty years array
        />
      </div>
    );
  } catch (error) {
    console.error('Error:', error);
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <section>
            <h2 className="text-3xl font-bold mb-6">Lỗi</h2>
            <p className="text-red-400">{error instanceof Error ? error.message : 'Không thể tải danh sách thể loại. Vui lòng thử lại sau.'}</p>
          </section>
        </div>
      </div>
    );
  }
}
