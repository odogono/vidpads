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

const log = createLog('player/yt');

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

      // playerRef.current.setPlaybackRate(0.5);
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
    ({ time, url, inProgress, requesterId }: PlayerSeek) => {
      if (!playerRef.current || url !== media.url) return;
      if (!playerRef.current) {
        log.warn('playerRef.current is null');
        return;
      }
      // todo - implement better controll of this property
      // yt recommend that the parameter is set to false while the seek is in progress
      // and then set it to true again after the seek is complete
      const allowSeekAhead = !inProgress;
      try {
        log.debug('[seekVideo]', { time, allowSeekAhead, requesterId });
        playerRef.current.seekTo(time, allowSeekAhead);
      } catch (error) {
        // todo - caused by another play request coming in while the player is still loading
        log.warn('error seeking video', (error as Error).message);
      }
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
    const container = containerRef.current;

    const initializePlayer = async () => {
      if (!container) return;

      await loadYouTubeApi();

      if (!isMounted || !container) return;

      const playerContainer = document.createElement('div');
      container.appendChild(playerContainer);

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
            log.debug('[onReady]', media.url, event);

            // log.debug('[onReady]', event.target.getAvailablePlaybackRates());
            // result: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
          },
          onStateChange: (event) => {
            const { data } = event;
            if (!isMounted) return;
            if (data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (data === window.YT.PlayerState.PAUSED) {
              events.emit('video:stopped', {
                url: media.url,
                time: playerRef.current?.getCurrentTime() ?? 0
              });
              setIsPlaying(false);
            } else if (data === window.YT.PlayerState.ENDED) {
              handleEnded();
            }
            log.debug('[onStateChange]', media.url, PlayerStateToString(data));
          },
          onError: (event) => {
            log.debug('[onError]', media.url, event);
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
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [events, handleEnded, media.url, videoId]);

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

  const extractThumbnail = useCallback(
    ({ time, url, additional }: PlayerExtractThumbnail) => {
      if (!playerRef.current) return;
      if (url !== media.url) return;

      // sadly, extracting the thumbnail at the current time is not possible
      // with the YouTube API. So the event is emitted anyway to ensure
      // the start and end times are persisted
      events.emit('video:thumbnail-extracted', {
        url,
        time,
        additional
      });
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

const PlayerStateToString = (state: number) => {
  switch (state) {
    case window.YT.PlayerState.UNSTARTED:
      return 'UNSTARTED';
    case window.YT.PlayerState.ENDED:
      return 'ENDED';
    case window.YT.PlayerState.PLAYING:
      return 'PLAYING';
    case window.YT.PlayerState.PAUSED:
      return 'PAUSED';
    case window.YT.PlayerState.BUFFERING:
      return 'BUFFERING';
    case window.YT.PlayerState.CUED:
      return 'CUED';
    default:
      return `UNKNOWN:${state}`;
  }
};
