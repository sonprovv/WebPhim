declare module 'videojs-hls-quality-selector' {
  import videojs from 'video.js';
  
  interface HlsQualitySelectorOptions {
    displayCurrentQuality?: boolean;
    placementIndex?: number;
    vjsIconClass?: string;
  }

  function hlsQualitySelector(options?: HlsQualitySelectorOptions): (player: videojs.Player) => void;
  
  export = hlsQualitySelector;
}
