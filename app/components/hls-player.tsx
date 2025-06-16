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
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState<any>(null);

  // Initialize video.js player
  useEffect(() => {
    if (!videoRef.current) return;

    // Only initialize once
    if (player) return;

    try {
      const videoJsOptions = {
        controls,
        autoplay: autoPlay,
        preload: "auto",
        fluid: true,
        sources: [
          {
            src,
            type: "application/x-mpegURL",
          },
        ],
        poster,
        html5: {
          vhs: {
            overrideNative: true,
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            useDevicePixelRatio: true,
          },
        },
      };

      const videoPlayer = videojs(videoRef.current, videoJsOptions, () => {
        videoPlayer.log("Player is ready");
        setIsPlaying(autoPlay);
      });

      videoPlayer.on("error", () => {
        const error = videoPlayer.error();
        setError(
          `Video playback error: ${error?.message || "Unknown error"}`
        );
      });

      videoPlayer.on("play", () => setIsPlaying(true));
      videoPlayer.on("pause", () => setIsPlaying(false));
      videoPlayer.on("ended", () => setIsPlaying(false));

      setPlayer(videoPlayer);

      // Cleanup on unmount
      return () => {
        if (videoPlayer) {
          videoPlayer.dispose();
        }
      };
    } catch (err) {
      setError(`Failed to initialize video player: ${err}`);
      console.error("VideoJS initialization error:", err);
    }
  }, [src, autoPlay, controls, poster]);

  // Handle source changes
  useEffect(() => {
    if (player && src) {
      player.src([
        {
          src,
          type: "application/x-mpegURL",
        },
      ]);
    }
  }, [src, player]);

  // Handle poster changes
  useEffect(() => {
    if (player && poster) {
      player.poster(poster);
    }
  }, [poster, player]);

  // Handle autoPlay changes
  useEffect(() => {
    if (!player) return;

    if (autoPlay) {
      player.play().catch((err: any) => {
        console.error("Autoplay failed:", err);
        setError("Autoplay was prevented. Please click the play button to start playback.");
      });
    } else {
      player.pause();
    }
  }, [autoPlay, player]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!player) return;
      if (document.fullscreenElement) {
        player.requestFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [player]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!player) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          if (isPlaying) {
            player.pause();
          } else {
            player.play();
          }
          break;
        case "m":
          e.preventDefault();
          player.muted(!player.muted());
          break;
        case "arrowleft":
          e.preventDefault();
          player.currentTime(Math.max(0, player.currentTime() - 5));
          break;
        case "arrowright":
          e.preventDefault();
          player.currentTime(
            Math.min(player.duration(), player.currentTime() + 5)
          );
          break;
        case "f":
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            player.requestFullscreen();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [player, isPlaying]);

  // Error boundary
  if (error) {
    return (
      <div className={`aspect-video bg-black/80 flex items-center justify-center rounded-lg ${className}`}>
        <div className="text-center p-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Playback Error</h3>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Reload Player
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`video-container ${className}`}>
      <video
        ref={videoRef}
        className="video-js vjs-default-skin vjs-big-play-centered"
        playsInline
      />
      <style jsx global>{`
        .video-container {
          position: relative;
          width: 100%;
          background: #000;
        }
        .video-js {
          width: 100%;
          aspect-ratio: 16/9;
          background: #000;
        }
        .vjs-big-play-button {
          border: none;
          background-color: rgba(239, 68, 68, 0.8);
          border-radius: 50%;
          width: 70px;
          height: 70px;
          line-height: 70px;
          margin: -35px 0 0 -35px;
          transition: all 0.2s;
        }
        .vjs-big-play-button:hover {
          background-color: rgba(239, 68, 68, 1);
        }
        .vjs-big-play-button .vjs-icon-placeholder:before {
          line-height: 70px;
        }
      `}</style>
    </div>
  );
}
