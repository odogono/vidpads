interface YT {
  Player: {
    new (
      elementId: string | HTMLDivElement,
      options: {
        videoId?: string;
        width?: number | string;
        height?: number | string;
        playerVars?: {
          autoplay?: 0 | 1;
          controls?: 0 | 1;
          disablekb?: 0 | 1;
          start?: number;
          end?: number;
          loop?: 0 | 1;
          mute?: 0 | 1;
          playsinline?: 0 | 1;
          iv_load_policy?: 1 | 3;
          rel?: 0 | 1;
          enablejsapi?: 0 | 1;
        };
        events?: {
          onReady?: (event: { target: YTPlayer }) => void;
          onStateChange?: (event: {
            target: YTPlayer;
            data: YT.PlayerState;
          }) => void;
          onError?: (event: Error) => void;
        };
      }
    ): YT.Player;
  };
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

interface YTPlayer {
  odgnId: string;
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  getAvailablePlaybackRates(): number[];
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): YT.PlayerState;
  mute(): void;
  unMute(): void;
  destroy(): void;
  setVolume(volume: number): void;
}

interface Window {
  YT: YT;
  onYouTubeIframeAPIReady: () => void;
}
