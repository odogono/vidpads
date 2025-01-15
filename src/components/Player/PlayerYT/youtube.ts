import { createLog } from '@helpers/log';
import { IvLoadPolicy, PlayerState, Rel } from './types';

const log = createLog('youtubeapi');

const loadYouTubeApi = async () => {
  if (window.YT) {
    return window.YT;
  }

  // if (youtubeApiPromise) return youtubeApiPromise;

  return new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      return resolve(window.YT);
    }

    try {
      const tag = document.createElement('script');
      tag.id = 'youtube-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } catch (error) {
      // console.error('Error loading YouTube API', error);
      return reject(error);
    }

    // Store the original callback if it exists
    const originalCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      // Call the original callback if it exists
      if (originalCallback) {
        originalCallback();
      }
      resolve(window.YT);
      return;
    };
  });
};

export interface InitializePlayerProps {
  container: HTMLDivElement;
  videoId: string;
  onReady: (player: YTPlayer) => void;
  onStateChange: (player: YTPlayer, state: PlayerState) => void;
  onError: (event: Error) => void;
}

export const initializePlayer = async ({
  container,
  videoId,
  onReady,
  onStateChange,
  onError
}: InitializePlayerProps) => {
  if (!container) return;

  await loadYouTubeApi();

  const playerContainer = document.createElement('div');
  container.appendChild(playerContainer);

  const player = new window.YT.Player(playerContainer, {
    videoId,
    width: '100%',
    height: '100%',
    playerVars: {
      // enablejsapi: 1,
      playsinline: 1,
      disablekb: 1, // disable keyboard controls
      controls: 0, // disable controls
      rel: Rel.SHOW_RELATED_VIDEOS,
      iv_load_policy: IvLoadPolicy.HIDE_VIDEO_ANNOTATIONS
    },
    events: {
      onReady: (event) => {
        onReady(event.target);
      },
      onStateChange: (event) => {
        onStateChange(event.target, event.data);
      },
      onError
    }
  });

  return player;
};
