'use client';

import { useState } from 'react';
import { Play, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface EpisodeListProps {
  episodes: {
    server_name: string;
    server_data: {
      name: string;
      slug: string;
      filename: string;
      link_embed: string;
      link_m3u8: string;
      episode_number?: number;
    }[];
  }[];
  movieSlug: string;
  currentEpisode?: string | null;
  itemsPerPage?: number;
}

// Function to extract episode number from filename or slug
const extractEpisodeNumber = (filename: string, slug: string): number => {
  // Try to get from filename first (format: ...T01-... or ...T1-...)
  const filenameMatch = filename.match(/T(\d+)(?:-|$)/i);
  if (filenameMatch) return parseInt(filenameMatch[1], 10);
  
  // If not found in filename, try to get from slug (format: tap-1, tap-01, tap1, tap01)
  const slugMatch = slug.match(/^(?:tap-?|ep-?)?(\d+)$/i) || slug.match(/(\d+)$/);
  if (slugMatch) return parseInt(slugMatch[1], 10);
  
  // If still not found, return 0
  return 0;
};

export function EpisodeList({ 
  episodes, 
  movieSlug, 
  currentEpisode,
  itemsPerPage = 30
}: EpisodeListProps) {
  const [expandedServer, setExpandedServer] = useState<string | null>(null);
  const [visibleEpisodes, setVisibleEpisodes] = useState<number>(itemsPerPage);

  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        Không có tập phim nào
      </div>
    );
  }

  // Process episodes: add episode number and sort
  const processedEpisodes = episodes.map(server => ({
    ...server,
    server_data: server.server_data
      .map(episode => {
        const epNumber = extractEpisodeNumber(episode.filename, episode.slug);
        return {
          ...episode,
          episode_number: epNumber,
          // Use the extracted number or fallback to array index + 1
          displayNumber: epNumber > 0 ? epNumber : (server.server_data.indexOf(episode) + 1)
        };
      })
      .sort((a, b) => a.episode_number - b.episode_number)
  }));

  const toggleServer = (serverName: string) => {
    setExpandedServer(expandedServer === serverName ? null : serverName);
  };

  const loadMoreEpisodes = () => {
    setVisibleEpisodes(prev => prev + itemsPerPage);
  };

  return (
    <div className="space-y-4">
      {processedEpisodes.map((server, index) => {
        const isExpanded = expandedServer === server.server_name || processedEpisodes.length === 1;
        const episodesToShow = isExpanded 
          ? server.server_data.slice(0, visibleEpisodes)
          : [];
        const hasMore = server.server_data.length > visibleEpisodes;
        
        return (
          <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleServer(server.server_name)}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-700 hover:bg-gray-600 transition-colors text-left"
            >
              <h3 className="text-lg font-semibold text-white">
                {server.server_name} <span className="text-sm text-gray-400 ml-2">({server.server_data.length} tập)</span>
              </h3>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-300" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-300" />
              )}
            </button>
            
            {isExpanded && (
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {episodesToShow.map((episode) => {
                    const isCurrent = currentEpisode === episode.slug.split('-').pop() || 
                                    currentEpisode === `tap-${episode.displayNumber}`;
                    
                    return (
                      <Link
                        key={episode.slug}
                        href={`/phim/${movieSlug}/xem/${episode.slug || `tap-${episode.displayNumber}`}` + `?server=${index}`}
                        className={`inline-flex items-center justify-center min-w-[44px] h-10 rounded-md ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        } transition-colors relative group`}
                        title={`Tập ${episode.displayNumber}`}
                      >
                        <span className="px-2 font-medium">{episode.displayNumber}</span>
                        {isCurrent && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </Link>
                    );
                  })}
                </div>
                
                {hasMore && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={loadMoreEpisodes}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm rounded-md text-gray-300 transition-colors"
                    >
                      Xem thêm tập
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
