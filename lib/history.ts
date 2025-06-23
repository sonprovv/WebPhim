// Utilities for saving watch history in browser localStorage


export interface HistoryItem {
  slug: string
  episodeSlug: string
  title: string
  posterUrl?: string
  viewedAt: string
}

const STORAGE_KEY = 'watchHistory';

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addToHistory(item: Omit<HistoryItem, 'viewedAt'>) {
  if (typeof window === 'undefined') return;

  const existing: HistoryItem[] = getHistory();

  const filtered = existing.filter(
    (h) => !(h.slug === item.slug && h.episodeSlug === item.episodeSlug)
  );

  const newHistory: HistoryItem[] = [
    {
      ...item,
      viewedAt: new Date().toISOString(),
    },
    ...filtered,
  ].slice(0, 100);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
}
