import { useCallback, useEffect, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import {
  PlayerExtractThumbnail,
  PlayerPlay,
  PlayerProps,
  PlayerSeek,
  PlayerStop
} from '../types';
import { PlayerStateToString } from './helpers';
import { PlayerState } from './types';
import { initializePlayer } from './youtube';

const log = createLog('player/yt');

export const PlayerYT = ({ media }: PlayerProps) => {
  const events = useEvents();
  const playerRef = useRef<YTPlayer | null>(null);
  const stateStringRef = useRef('');
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);
  const endTimeRef = useRef(Number.MAX_SAFE_INTEGER);
  const isLoopedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { id: videoId } = media;

  const playVideo = useCallback(
    ({ start, end, isLoop, url, volume }: PlayerPlay) => {
      if (!playerRef.current || url !== media.url) return;
      const player = playerRef.current;
      const setVolume = volume ?? 100;

      const startTime = (start ?? 0) === -1 ? 0 : (start ?? 0);
      const endTime =
        (end ?? Number.MAX_SAFE_INTEGER) === -1
          ? Number.MAX_SAFE_INTEGER
          : (end ?? Number.MAX_SAFE_INTEGER);

      startTimeRef.current = startTime;
      endTimeRef.current = endTime;
      isLoopedRef.current = isLoop ?? false;

      if (setVolume === 0) {
        player.mute();
      } else {
        player.unMute();
        player.setVolume(setVolume);
      }

      player.seekTo(startTime, true);
      player.playVideo();
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
        log.debug('[seekVideo]', {
          time,
          allowSeekAhead,
          requesterId,
          state: stateStringRef.current
        });
        playerRef.current.seekTo(time, allowSeekAhead);
      } catch (error) {
        // todo - caused by another play request coming in while the player is still loading
        log.warn('[seekVideo] error seeking video', (error as Error).message);
        log.debug('[seekVideo] state', {
          player: playerRef.current,
          state: stateStringRef.current
        });
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

    if (!isMounted || !container) return;

    (async () => {
      playerRef.current = await initializePlayer({
        container,
        videoId,
        onReady: (player) => {
          stateStringRef.current = PlayerStateToString(player.getPlayerState());

          log.debug('[onReady]', media.url, player, {
            time: player.getCurrentTime(),
            state: PlayerStateToString(player.getPlayerState())
          });

          // seek and play in order to buffer
          // as soon as the state changes to playing
          // we can stop it and declare the video ready
          seekVideo({
            url: media.url,
            time: 124.7,
            inProgress: false,
            requesterId: 'yt-player'
          });
          player.mute();
          player.playVideo();
          // target.pauseVideo();
          // target.unMute();

          // log.debug('[onReady]', event.target.getAvailablePlaybackRates());
          // result: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
        },

        onStateChange: (state: PlayerState) => {
          switch (state) {
            case PlayerState.PLAYING:
              setIsPlaying(true);
              break;
            case PlayerState.PAUSED:
              events.emit('video:stopped', {
                url: media.url,
                time: playerRef.current?.getCurrentTime() ?? 0
              });
              setIsPlaying(false);
              break;
            case PlayerState.ENDED:
              handleEnded();
              break;
            default:
              break;
          }
          stateStringRef.current = PlayerStateToString(state);
          log.debug('[onStateChange]', media.url, PlayerStateToString(state));
        },
        onError: (event) => {
          log.debug('[onError]', media.url, event);
        }
      });
    })();

    return () => {
      isMounted = false;
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [events, handleEnded, media.url, seekVideo, videoId]);

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
