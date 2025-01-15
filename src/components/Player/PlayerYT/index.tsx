import { useCallback, useEffect, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { PlayerProps } from '../types';
import {
  PlayerYTPlay,
  PlayerYTSeek,
  PlayerYTStop,
  usePlayerYTEvents
} from './useEvents';
import { initializePlayer } from './youtube';

const log = createLog('player/yt');

export const PlayerYT = ({ media }: PlayerProps) => {
  const events = useEvents();
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);
  const endTimeRef = useRef(Number.MAX_SAFE_INTEGER);
  const isLoopedRef = useRef(false);

  const { id: videoId } = media;

  const playVideo = useCallback(
    ({ player, start, end, isLoop, volume }: PlayerYTPlay) => {
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
    []
  );

  const stopVideo = useCallback(({ player, stateString }: PlayerYTStop) => {
    log.debug('[stopVideo]', {
      player,
      state: stateString
    });
    try {
      player.pauseVideo();
    } catch {
      log.debug('[stopVideo] ⚠️ error pausing video');
    }
  }, []);

  const seekVideo = useCallback(
    ({ player, time, inProgress, requesterId, stateString }: PlayerYTSeek) => {
      // todo - implement better controll of this property
      // yt recommend that the parameter is set to false while the seek is in progress
      // and then set it to true again after the seek is complete
      const allowSeekAhead = !inProgress;
      try {
        log.debug('[seekVideo]', {
          time,
          allowSeekAhead,
          requesterId
        });
        player.seekTo(time, allowSeekAhead);
      } catch {
        // todo - caused by another play request coming in while the player is still loading
        log.debug('[seekVideo] ⚠️ error seeking video');
        log.debug('[seekVideo] state', {
          player,
          state: stateString
        });
      }
    },
    []
  );

  const { onPlayerReady, onPlayerStateChange, onPlayerError } =
    usePlayerYTEvents({
      media,
      isLoopedRef,
      startTimeRef,
      endTimeRef,
      playVideo,
      stopVideo,
      seekVideo
    });

  useEffect(() => {
    let isMounted = true;
    const container = containerRef.current;

    if (!isMounted || !container) return;

    let player: YTPlayer;

    (async () => {
      player = await initializePlayer({
        container,
        videoId,
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      });
    })();

    return () => {
      isMounted = false;
      if (player) {
        player.destroy();
      }
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [
    events,
    media.url,
    onPlayerError,
    onPlayerReady,
    onPlayerStateChange,
    seekVideo,
    videoId
  ]);

  return (
    <div ref={containerRef} className='absolute top-0 left-0 w-full h-full' />
  );
};
