import { useCallback, useEffect, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import {
  PlayerExtractThumbnail,
  PlayerPlay,
  PlayerProps,
  PlayerSeek,
  PlayerStop
} from './types';

const log = createLog('YTPlayer');

// Create a promise to track when the API is ready
let youtubeApiPromise: Promise<void> | null = null;

const loadYouTubeApi = () => {
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    if (window.YT) {
      resolve();
      return;
    }

    // Store the original callback if it exists
    const originalCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      // Call the original callback if it exists
      if (originalCallback) {
        originalCallback();
      }
      resolve();
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  });

  return youtubeApiPromise;
};

export const YTPlayer = ({ media }: PlayerProps) => {
  const events = useEvents();
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);
  const endTimeRef = useRef(Number.MAX_SAFE_INTEGER);
  const isLoopedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { id: videoId } = media;

  const playVideo = useCallback(
    ({ start, end, isLoop, url }: PlayerPlay) => {
      if (!playerRef.current || url !== media.url) return;

      const startTime = (start ?? 0) === -1 ? 0 : (start ?? 0);
      const endTime =
        (end ?? Number.MAX_SAFE_INTEGER) === -1
          ? Number.MAX_SAFE_INTEGER
          : (end ?? Number.MAX_SAFE_INTEGER);

      startTimeRef.current = startTime;
      endTimeRef.current = endTime;
      isLoopedRef.current = isLoop ?? false;

      playerRef.current.seekTo(startTime, true);
      playerRef.current.playVideo();
    },
    [media.url]
  );

  const stopVideo = useCallback(
    ({ url }: PlayerStop) => {
      if (!playerRef.current || url !== media.url) return;
      playerRef.current.pauseVideo();
    },
    [media.url]
  );

  const seekVideo = useCallback(
    ({ time, url }: PlayerSeek) => {
      if (!playerRef.current || url !== media.url) return;
      playerRef.current.seekTo(time, true);
    },
    [media.url]
  );

  const handleEnded = useCallback(() => {
    log.debug('ended', media.url);
    if (isLoopedRef.current) {
      playerRef.current?.seekTo(startTimeRef.current, true);
      playerRef.current?.playVideo();
    } else {
      stopVideo({ url: media.url });
    }
  }, [media.url, stopVideo]);

  useEffect(() => {
    let isMounted = true;

    const initializePlayer = async () => {
      if (!containerRef.current) return;

      await loadYouTubeApi();

      if (!isMounted || !containerRef.current) return;

      // Create a container element for the player
      const playerContainer = document.createElement('div');
      containerRef.current.appendChild(playerContainer);

      playerRef.current = new window.YT.Player(playerContainer, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          playsinline: 1,
          controls: 0,
          rel: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: (event) => {
            log.debug('ready', media.url, event);
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              handleEnded();
            }
          },
          onError: (event) => {
            log.debug('error', media.url, event);
          }
        }
      });
    };

    initializePlayer();

    return () => {
      isMounted = false;
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [handleEnded, media.url, videoId]);

  useEffect(() => {
    const checkProgress = () => {
      if (!playerRef.current || !isPlaying) return;

      const currentTime = playerRef.current.getCurrentTime();
      if (currentTime >= endTimeRef.current) {
        if (isLoopedRef.current) {
          playerRef.current.seekTo(startTimeRef.current, true);
        } else {
          stopVideo({ url: media.url });
        }
      }
    };

    const intervalId = setInterval(checkProgress, 100);
    return () => clearInterval(intervalId);
  }, [isPlaying, media.url, stopVideo]);

  // Rest of your handlers (playVideo, stopVideo, seekVideo, extractThumbnail)
  // remain mostly the same, just update to use playerRef.current instead of videoRef.current

  const extractThumbnail = useCallback(
    ({ time, url, additional }: PlayerExtractThumbnail) => {
      if (!playerRef.current) return;
      if (url !== media.url) return;

      events.emit('video:thumbnail-extracted', {
        url,
        time,
        additional
      });

      // log.debug('[extractThumbnail]', id, time);
      // extractVideoThumbnailFromVideo({
      //   video: videoRef.current,
      //   frameTime: time
      // }).then((thumbnail) => {
      //   events.emit('video:thumbnail-extracted', {
      //     url,
      //     time,
      //     thumbnail,
      //     additional
      //   });
      // });
    },
    [media.url, events]
  );

  useEffect(() => {
    events.on('video:start', playVideo);
    events.on('video:stop', stopVideo);
    events.on('video:seek', seekVideo);
    events.on('video:extract-thumbnail', extractThumbnail);
    return () => {
      events.off('video:start', playVideo);
      events.off('video:stop', stopVideo);
      events.off('video:seek', seekVideo);
      events.off('video:extract-thumbnail', extractThumbnail);
    };
  }, [events, extractThumbnail, playVideo, seekVideo, stopVideo]);

  return (
    <div ref={containerRef} className='absolute top-0 left-0 w-full h-full' />
  );
};
