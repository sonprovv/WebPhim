"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { AlertCircle } from "lucide-react";

// Log video.js version
console.log('video.js loaded');

// Extend Window interface to include videojs and other globals
declare global {
  interface Window {
    videojs: typeof videojs;
    videojsPluginsRegistered?: boolean;
    opr?: any;
    opera?: any;
  }
}

// Setup videojs with native HLS support
if (typeof window !== "undefined") {
  console.log("Setting up video.js on window object");
  // @ts-ignore
  window.videojs = videojs;
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
}: HLSPlayerProps): React.ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const isMounted = useRef(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize video.js player
  const initializePlayer = useCallback(() => {
    if (!videoRef.current || !src || !isMounted.current) {
      console.log("Skipping player init: missing ref, src, or unmounted");
      return;
    }

    console.log("Initializing video player with src:", src);
    console.log("Video element:", videoRef.current);
    console.log("Is video element in DOM:", document.body.contains(videoRef.current));
    
    setIsLoading(true);
    setError(null);

    try {
      // Cấu hình cơ bản cho video.js
      const videoJsOptions: any = {
        controls: true,
        autoplay: autoPlay,
        preload: "auto",
        fluid: true,
        poster,
        techOrder: ["html5"],
        controlBar: {
          playToggle: true,
          currentTimeDisplay: true,
          timeDivider: true,
          durationDisplay: true,
          progressControl: true,
          remainingTimeDisplay: true,
          volumePanel: true,
          fullscreenToggle: true
        },
        html5: {
          hls: {
            overrideNative: true,
            handleManifestRedirects: true,
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            debug: process.env.NODE_ENV === 'development',
            manifestRequestTimeout: 15000,
            manifestLoadPolicy: {
              default: {
                maxTimeToFirstByteMs: 15000,
                maxLoadTimeMs: 45000,
                timeoutRetry: {
                  maxNumRetry: 6,
                  retryDelayMs: 2000,
                  maxRetryDelayMs: 10000
                }
              }
            },
            xhrSetup: function(xhr: XMLHttpRequest) {
              xhr.withCredentials = false;
            }
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false
        }
      };

      // Thêm nguồn video
      const source = {
        src,
        type: src.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4"
      };
      
      // Thêm source vào options
      videoJsOptions.sources = [source];

      console.log("Creating video.js instance with options:", videoJsOptions);
      
      try {
        const player = videojs(videoRef.current, videoJsOptions, function onPlayerReady() {
          console.log("Video.js player is ready");
          console.log("Player element:", this.el());
          console.log("Player tech:", this.tech_);
          
          // Đảm bảo controls luôn hiển thị
          this.controls(true);
          
          if (isMounted.current) {
            console.log("Setting player ready state");
            setIsPlayerReady(true);
            setIsLoading(false);
            
            // Thử phát tự động nếu được bật
            if (autoPlay) {
              console.log("Attempting autoplay...");
              const playPromise = this.play();
              
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log("Autoplay successful");
                  })
                  .catch(error => {
                    console.log("Auto-play was prevented, showing controls");
                    console.error("Autoplay error:", error);
                    this.controls(true);
                    
                    // Thêm sự kiện click để phát video khi người dùng tương tác
                    const playOnClick = (() => {
                      const player = this as any; // Using 'any' as a last resort for video.js player type
                      return function(this: any) {
                        console.log("User clicked, attempting to play...");
                        player.play()
                          .then(() => {
                            console.log("Playback started after user interaction");
                            player.off('click', playOnClick);
                          })
                          .catch((e: Error) => {
                            console.error("Failed to start playback after click:", e);
                          });
                      };
                    })();
                    this.on('click', playOnClick);
                  });
              }
            }
          }
        });

        playerRef.current = player;

        // Thêm event listeners
        player.on('playing', () => {
          console.log("Video is playing");
          if (isMounted.current) {
            setIsLoading(false);
          }
        });

        // Xử lý lỗi phát video
        player.on('error', () => {
          const error = player.error();
          console.error("Video player error:", error);
          
          if (isMounted.current) {
            let errorMessage = "Lỗi khi phát video. ";
            
            if (error.code === 1) {
              errorMessage += "Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.";
            } else if (error.code === 2) {
              errorMessage += "Không thể tải video. Vui lòng thử server khác.";
            } else if (error.code === 3) {
              errorMessage += "Lỗi phát video. Vui lòng thử lại.";
            } else if (error.code === 4) {
              errorMessage += "Video không hỗ trợ. Vui lòng thử server khác.";
            }
            
            setError(errorMessage);
            setIsLoading(false);
            
            // Auto retry after 5 seconds
            setTimeout(() => {
              if (isMounted.current && player && !player.isDisposed()) {
                player.load();
                player.play().catch(() => {
                  console.log("Auto-retry playback failed");
                });
              }
            }, 5000);
          }
        });

        // Cleanup function
        return () => {
          if (player && !player.isDisposed()) {
            player.dispose();
          }
        };
      } catch (err) {
        console.error("Error initializing video player:", err);
        if (isMounted.current) {
          setError("Không thể khởi tạo trình phát video. Vui lòng kiểm tra URL.");
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error("Error initializing video player:", err);
      if (isMounted.current) {
        setError("Không thể khởi tạo trình phát video. Vui lòng kiểm tra URL.");
        setIsLoading(false);
      }
    }
  }, [src, autoPlay, controls, poster]);

  // Handle player initialization
  useEffect(() => {
    initializePlayer();

    return () => {
      isMounted.current = false;
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
        console.log("Player disposed");
      }
    };
  }, [initializePlayer]);

  // Handle source changes
  useEffect(() => {
    if (!playerRef.current || !src) return;

    console.log("Source changed to:", src);
    setIsLoading(true);
    setError(null);
    setIsPlayerReady(false);

    try {
      playerRef.current.src({
        src,
        type: src.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4",
      });
      
      // Đảm bảo controls luôn hiển thị
      playerRef.current.controls(true);
      
      // Thử phát tự động nếu được bật
      if (autoPlay) {
        const playPromise = playerRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error: unknown) => {
            console.log("Auto-play was prevented, showing controls");
            playerRef.current?.controls(true);
          });
        }
      }
    } catch (err) {
      console.error("Error changing source:", err);
      setError("Không thể tải video. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [src, autoPlay]);

  // Handle poster changes
  useEffect(() => {
    if (playerRef.current && poster) {
      playerRef.current.poster(poster);
    }
  }, [poster]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!playerRef.current) return;
      if (document.fullscreenElement) {
        playerRef.current.requestFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!playerRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerRef.current) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          if (playerRef.current.paused()) {
            playerRef.current.play().catch((err: any) =>
              console.error("Play failed:", err)
            );
          } else {
            playerRef.current.pause();
          }
          break;
        case "m":
          e.preventDefault();
          playerRef.current.muted(!playerRef.current.muted());
          break;
        case "f":
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            playerRef.current.requestFullscreen();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          playerRef.current.currentTime(
            Math.max(0, playerRef.current.currentTime() - 5)
          );
          break;
        case "ArrowRight":
          e.preventDefault();
          playerRef.current.currentTime(
            Math.min(
              playerRef.current.duration(),
              playerRef.current.currentTime() + 5
            )
          );
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Log player state changes
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Player state changed:", {
        isPlayerReady,
        error,
        isLoading,
        src: src ? `${src.substring(0, 30)}...` : "no source",
        hasPoster: !!poster,
      });
    }
  }, [isPlayerReady, error, isLoading, src, poster]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className={`video-container ${className}`}>
        <div className="flex flex-col items-center justify-center w-full h-64 bg-gray-900 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
          <p className="text-lg font-medium">Đang tải trình phát video...</p>
          {src && (
            <p className="text-sm text-gray-400 mt-2">
              Nguồn: {src.split("/").slice(-1)[0]}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !src) {
    const displayError = error || "Không tìm thấy nguồn video";

    if (process.env.NODE_ENV === "development") {
      console.error("Video player error:", {
        error: error || "No error message",
        src: src ? `${src.substring(0, 30)}...` : "empty",
        hasPoster: !!poster,
        autoPlay,
        controls,
        className,
      });
    }

    return (
      <div className={`video-container ${className}`}>
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Lỗi phát video</h3>
            <p className="text-gray-300 mb-6 max-w-md">{displayError}</p>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Thử lại
              </button>
              {src && (
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Mở trong tab mới
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`video-container ${className}`}>
      <div className="max-w-4xl mx-auto w-full">
        <video
          ref={videoRef}
          className="video-js vjs-default-skin vjs-big-play-centered"
          playsInline
          poster={poster}
        />
      </div>
      <style jsx global>{`
        .video-container {
          position: relative;
          width: 100%;
          background: #000;
          padding: 0 1rem;
        }
        .video-js {
          width: 100%;
          max-height: 70vh;
          aspect-ratio: 16 / 9;
          background: #000;
          margin: 0 auto;
          border-radius: 8px;
          overflow: hidden;
        }
        .vjs-big-play-button {
          border: none;
          background-color: rgba(239, 68, 68, 0.8);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          line-height: 60px;
          margin: -30px 0 0 -30px;
          transition: all 0.2s;
        }
        .vjs-big-play-button:hover {
          background-color: rgba(239, 68, 68, 1);
          transform: scale(1.1);
        }
        .vjs-big-play-button .vjs-icon-placeholder:before {
          line-height: 60px;
          font-size: 2em;
        }
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .video-js {
            max-height: 50vh;
          }
        }
      `}</style>
    </div>
  );
}