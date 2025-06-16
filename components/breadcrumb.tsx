'use client';

import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Breadcrumb() {
  const pathname = usePathname();
  
  // Skip breadcrumb on homepage
  if (pathname === '/') return null;

  // Extract and format path segments
  const pathSegments = pathname
    .split('/')
    .filter(Boolean)
    .map(segment => ({
      // Format segment text (convert kebab-case to Title Case)
      text: segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }));

  // Custom labels for path segments
  const customLabels: Record<string, string> = {
    'phim': 'Phim',
    'danh-sach': 'Danh sách',
    'tim-kiem': 'Tìm kiếm',
    'the-loai': 'Thể loại',
    'quoc-gia': 'Quốc gia',
  };

  // Get the last segment for the current page title
  const currentPage = pathSegments[pathSegments.length - 1]?.text || '';
  const parentPage = pathSegments.length > 1 ? pathSegments[pathSegments.length - 2]?.text : '';

  // If we're on a movie page, show a simplified breadcrumb
  if (pathSegments[0]?.text.toLowerCase() === 'phim' && pathSegments.length >= 2) {
    return (
      <div className="flex items-center text-sm text-gray-400 mb-4">
        <span className="text-gray-400">Phim</span>
        <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
        <span className="text-white">
          {customLabels[parentPage.toLowerCase()] || parentPage}
        </span>
        <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
        <span className="text-white">
          {customLabels[currentPage.toLowerCase()] || currentPage}
        </span>
      </div>
    );
  }

  // Default breadcrumb for other pages
  return (
    <div className="flex items-center text-sm text-gray-400 mb-4">
      {pathSegments.map((segment, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />}
          <span className={index === pathSegments.length - 1 ? 'text-white' : ''}>
            {customLabels[segment.text.toLowerCase()] || segment.text}
          </span>
        </div>
      ))}
    </div>
  );
}
