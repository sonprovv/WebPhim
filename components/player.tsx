'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Function to check if a URL can be embedded in an iframe
const isEmbeddable = (url: string): boolean => {
  try {
    if (!url) return false;
    
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    // List of domains that are known to block embedding
    const blockedDomains = [
      'google.com',
      'youtube.com',
      'facebook.com',
      'twitter.com',
      'instagram.com',
      'tiktok.com',
      'netflix.com',
      'hulu.com',
      'disneyplus.com',
      'hbomax.com',
      'amazon.com',
      'primevideo.com',
      'vimeo.com',
      'dailymotion.com'
    ];
    
    // Check if the URL is from a blocked domain
    const isBlocked = blockedDomains.some(domain => {
      return (
        hostname === domain || 
        hostname.endsWith(`.${domain}`) ||
        hostname.includes(`.${domain}.`)
      );
    });
    
    // Additional checks for common patterns that might indicate blocking
    if (isBlocked) return false;
    
    // Check for common video hosting domains that typically allow embedding
    const allowedPatterns = [
      /^(www\.)?(player\.|embed\.|www\.)?(vimeo\.com|dailymotion\.com|youtube\.com\/embed|youtu\.be|player\.vimeo\.com|drive\.google\.com\/file\/d\/)/i
    ];
    
    return allowedPatterns.some(pattern => pattern.test(url));
  } catch (error) {
    //console.error('Error checking if URL is embeddable:', error);
    return false;
  }
};

interface PlayerProps {
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

export function Player({ movie, episodes }: PlayerProps) {
  const currentEpisode = episodes?.[0]?.server_data?.[0];
  const [embedError, setEmbedError] = useState(false);
  const embedUrl = currentEpisode?.link_embed;
  const canEmbed = embedUrl && isEmbeddable(embedUrl) && !embedError;

  const handleIframeError = () => {
    //console.error('Failed to load iframe content');
    setEmbedError(true);
  };

  if (!currentEpisode) {
    return (
      <Card className="w-full p-8">
        <div className="text-center text-red-400">
          Không tìm thấy tập phim
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full min-h-[400px] flex flex-col">
      {canEmbed ? (
        <iframe
          src={embedUrl}
          className="w-full h-[600px]"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={movie.name}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          onError={handleIframeError}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="text-red-500 font-medium">
            Không thể phát video trực tiếp tại đây
          </div>
          <p className="text-gray-400">
            Trình phát video không khả dụng. Vui lòng xem video trực tiếp trên trang nguồn.
          </p>
          {embedUrl && (
            <Button asChild variant="outline">
              <a 
                href={embedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Mở video trên trang nguồn
              </a>
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
