"use client";

import { useEffect, useState } from 'react';
import { getHistory, HistoryItem } from '@/lib/history';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/header';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[] | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (history === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 w-full">
        <h1 className="text-2xl font-bold mb-6">Lịch sử xem</h1>
        {history.length === 0 ? (
          <p>Bạn chưa xem bộ phim nào.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.map((item) => (
              <Link key={`${item.slug}-${item.episodeSlug}-${item.viewedAt}`} href={`/phim/${item.slug}/xem/${item.episodeSlug}`} className="group">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-800">
                  {item.posterUrl ? (
                    <Image src={item.posterUrl} alt={item.title} fill className="object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-700 text-sm">No Image</div>
                  )}
                </div>
                <div className="mt-2 text-sm leading-tight line-clamp-2">{item.title}</div>
                <div className="text-xs text-gray-400">Tập: {item.episodeSlug?.split('-').pop() ?? 'N/A'}</div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
