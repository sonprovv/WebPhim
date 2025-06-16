"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { AlertCircle } from "lucide-react";

// Declare window type for our plugins
declare global {
  interface Window {
    videojsPluginsRegistered?: boolean;
  }
}

interface HLSPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
}

export function HLSPlayer({
  src,
  poster,
  className = "",
  autoPlay = false,
  controls = true,
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

    // Register plugins only once - using module level variable
  useEffect(() => {
    const registerPlugins = async () => {
      if (videojs.getPlugin('qualityLevels') && videojs.getPlugin('hlsQualitySelector')) {
        return; // Already registered
      }
      
      try {
        const [qualityLevels, hlsQualitySelector] = await Promise.all([
          import("videojs-contrib-quality-levels"),
          import("videojs-hls-quality-selector"),
        ]);
        
        if (!videojs.getPlugin('qualityLevels')) {
          videojs.registerPlugin("qualityLevels", qualityLevels.default);
        }
        if (!videojs.getPlugin('hlsQualitySelector')) {
          videojs.registerPlugin("hlsQualitySelector", hlsQualitySelector.default);
        }
      } catch (err) {
        console.error("Failed to register video.js plugins:", err);
      }
    };
    
    registerPlugins();
  }, []);

  // Handle play button click
  const handlePlayClick = useCallback(() => {
    if (playerRef.current) {
      setError(null);
      playerRef.current.play().catch((err: Error) => {
        console.warn("Play failed:", err);
        setError("Không thể phát video. Vui lòng thử lại.");
      });
    }
  }, []);
  
  // Initialize player
  useEffect(() => {
    let player: any;
    let container: HTMLElement | null = null;
    let isMounted = true;

    const initPlayer = async () => {
      if (!videoRef.current || !window.videojsPluginsRegistered) return;
      
      // Skip if player is already initialized
      const existingPlayer = videojs.getPlayers()[videoRef.current.id];
      if (existingPlayer) {
        console.log('Player already initialized, reusing instance');
        playerRef.current = existingPlayer;
        setIsLoading(false);
        return;
      }

      try {
        // Ensure the video element has an ID for reference
        if (!videoRef.current.id) {
          videoRef.current.id = `video-${Math.random().toString(36).substr(2, 9)}`;
        }
        
        container = videoRef.current.parentElement;
        
        player = videojs(videoRef.current, {
          autoplay: false,
          controls: true,
          sources: [{ src, type: "application/x-mpegURL" }],
          poster,
          fill: true,
          html5: {
            vhs: {
              overrideNative: true,
              enableLowInitialPlaylist: true,
              smoothQualityChange: true,
            },
          },
          userActions: {
            doubleClick: true,
            hotkeys: true,
          }
        }, () => {
          if (!isMounted) return;
          
          console.log("Player is ready");
          setIsLoading(false);
          
          // Initialize quality selector if available
          try {
            if (player.qualityLevels) {
              player.qualityLevels();
            }
            if (player.hlsQualitySelector) {
              player.hlsQualitySelector({ displayCurrentQuality: true });
            }
          } catch (e) {
            console.warn('Failed to initialize quality selector:', e);
          }
          
          // Don't auto-play immediately, show play button instead
          if (autoPlay) {
            // Show play button overlay
            setError("Nhấn vào đây để phát video");
          }
        });

        // Error handling
        player.on('error', () => {
          if (!isMounted) return;
          
          const error = player.error();
          console.error('VideoJS Error:', error);
          setError("Không thể tải video. Vui lòng thử lại.");
          setIsLoading(false);
        });

        playerRef.current = player;
        
      } catch (err) {
        console.error("Error initializing video player:", err);
        if (isMounted) {
          setError("Không thể tải trình phát video. Vui lòng thử lại.");
          setIsLoading(false);
        }
      }
    };

    // Small delay to ensure plugins are registered
    const timer = setTimeout(initPlayer, 100);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      if (player) {
        try {
          // Only dispose if the component is being unmounted
          if (videoRef.current && !document.body.contains(videoRef.current)) {
            player.dispose();
          }
        } catch (e) {
          console.warn('Error cleaning up player:', e);
        }
      }
    };
  }, [src, poster, autoPlay]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl shadow-lg ${className}`}
      onClick={error === "Nhấn vào đây để phát video" ? handlePlayClick : undefined}
    >
      <div className="relative pt-[56.25%] bg-black">
        <video
          ref={videoRef}
          className="video-js vjs-default-skin absolute top-0 left-0 w-full h-full object-cover"
          poster={poster}
          playsInline
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-400"></div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 text-center space-y-4">
            {error === "Nhấn vào đây để phát video" ? (
              <div className="flex flex-col items-center justify-center space-y-2 w-full h-full cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                  <svg 
                    className="w-8 h-8 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
                <p className="text-lg font-semibold">{error}</p>
              </div>
            ) : (
              <>
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="text-lg font-semibold">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thử lại
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}