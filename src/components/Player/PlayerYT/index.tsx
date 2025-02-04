import { useCallback, useEffect, useRef } from 'react';

import { createLog } from '@helpers/log';
import { MediaYouTube } from '@model/types';
import {
  PlayerPlay,
  PlayerProps,
  PlayerSeek,
  PlayerSetPlaybackRate,
  PlayerSetVolume,
  PlayerStop
} from '../types';
import { PlayerStateToString } from './helpers';
import { PlayerState } from './types';
import { usePlayerYTEvents } from './useEvents';
import { destroyPlayer, initializePlayer } from './youtube';

export type PlayerReturn = [number, number]; // [currentTime, duration]

const log = createLog('player/yt', ['debug', 'error']);

export const PlayerYT = ({ media, padId: playerPadId }: PlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(0);
  const endTimeRef = useRef(Number.MAX_SAFE_INTEGER);
  const isLoopedRef = useRef(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const mediaUrl = media.url;
  const { videoId } = media as MediaYouTube;

  // useRenderingTrace('PlayerYT', {
  //   media,
  //   mediaUrl,
  //   playerPadId
  // });

  const playVideo = useCallback(
    ({ url, padId, start, end, isLoop, volume, playbackRate }: PlayerPlay) => {
      const player = playerRef.current;
      if (!player) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;

      const setVolume = (volume ?? 1) * 100;

      const startTime = (start ?? 0) === -1 ? 0 : (start ?? 0);
      const endTime =
        (end ?? Number.MAX_SAFE_INTEGER) === -1
          ? Number.MAX_SAFE_INTEGER
          : (end ?? Number.MAX_SAFE_INTEGER);

      startTimeRef.current = startTime;
      endTimeRef.current = endTime;
      isLoopedRef.current = isLoop ?? false;

      log.debug('playVideo', player.odgnId, {
        start: startTime,
        end: endTime,
        isLoop,
        volume: setVolume,
        playbackRate,
        playbackRates: player.getAvailablePlaybackRates()
      });

      if (setVolume === 0) {
        player.mute();
      } else {
        player.unMute();
        player.setVolume(setVolume);
        player.setPlaybackRate(playbackRate ?? 1);
      }

      player.seekTo(startTime, true);
      player.playVideo();

      return [player.getCurrentTime(), player.getDuration()] as PlayerReturn;
    },
    [mediaUrl, playerPadId]
  );

  const stopImmediate = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    player.pauseVideo();
  }, [playerRef]);

  const stopVideo = useCallback(
    ({ url, padId }: PlayerStop) => {
      const player = playerRef.current;
      if (!player) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;

      // log.debug('[stopVideo]', player.odgnId, {
      //   player,
      //   state: PlayerStateToString(player.getPlayerState())
      // });
      try {
        player.pauseVideo();
      } catch {
        log.debug('[stopVideo] ⚠️ error pausing video');
      }
      return [player.getCurrentTime(), player.getDuration()] as PlayerReturn;
    },
    [mediaUrl, playerPadId]
  );

  const seekVideo = useCallback(
    ({ url, time, inProgress, padId, requesterId }: PlayerSeek) => {
      const player = playerRef.current;
      if (!player) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;
      // TODO implement better controll of this property
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
        // TODO caused by another play request coming in while the player is still loading
        log.debug('[seekVideo] ⚠️ error seeking video');
        log.debug('[seekVideo] state', {
          player,
          state: PlayerStateToString(player.getPlayerState())
        });
      }
      return [player.getCurrentTime(), player.getDuration()] as PlayerReturn;
    },
    [mediaUrl, playerPadId]
  );

  const setVolume = useCallback(
    ({ url, padId, volume }: PlayerSetVolume) => {
      const player = playerRef.current;
      if (!player) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;
      log.debug('[setVolume]', { volume });
      player.setVolume(volume * 100);
    },
    [mediaUrl, playerPadId]
  );

  const setPlaybackRate = useCallback(
    ({ url, padId, rate }: PlayerSetPlaybackRate) => {
      const player = playerRef.current;
      if (!player) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;
      player.setPlaybackRate(rate);
      const playerRate = player.getPlaybackRate();
      log.debug('[setPlaybackRate]', { rate, playerRate });
    },
    [mediaUrl, playerPadId]
  );

  // takes care of preparing the player on mount for playback
  const {
    onPlayerCreated,
    onPlayerDestroyed,
    onPlayerReady,
    onPlayerStateChange,
    onPlayerError
  } = usePlayerYTEvents({
    mediaUrl,
    padId: playerPadId,
    isLoopedRef,
    startTimeRef,
    endTimeRef,
    playVideo,
    stopVideo,
    seekVideo,
    stopImmediate,
    setVolume,
    setPlaybackRate
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mounted = true;
    let player: YTPlayer | null = null;

    const init = async () => {
      log.debug('[useEffect][init] initialising player', videoId);
      try {
        const newPlayer = await initializePlayer({
          container,
          videoId,
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError
        });

        // Check if component is still mounted
        if (!mounted) {
          log.debug(
            '[useEffect][init] destroying non-mounted player',
            newPlayer.odgnId
          );
          destroyPlayer(null, newPlayer);
          return;
        }

        log.debug('[useEffect][init] initialised player', newPlayer.odgnId);
        onPlayerCreated(newPlayer);
        player = newPlayer;
        playerRef.current = newPlayer;
      } catch (error) {
        log.error('[useEffect][init] failed to initialize player', error);
      }
    };

    init();

    return () => {
      mounted = false;
      // clearTimeout(timeoutId);
      if (player) {
        log.debug('[useEffect][unmount] destroying player', player.odgnId);
        onPlayerDestroyed(player);
        playerRef.current = destroyPlayer(container, player);
      } else {
        // log.debug('[useEffect][unmount] no player to destroy');
      }
    };
  }, [
    onPlayerCreated,
    onPlayerDestroyed,
    onPlayerError,
    onPlayerReady,
    onPlayerStateChange,
    seekVideo,
    videoId
  ]);

  // handles the oneshot or looped behaviour
  useEffect(() => {
    const checkProgress = () => {
      const player = playerRef.current;
      if (!player) return;
      const isPlaying =
        player.getPlayerState &&
        player.getPlayerState() === PlayerState.PLAYING;
      if (!isPlaying) return;

      const currentTime = player.getCurrentTime();
      if (currentTime >= endTimeRef.current) {
        if (isLoopedRef.current) {
          seekVideo({
            url: mediaUrl,
            padId: playerPadId,
            time: startTimeRef.current,
            inProgress: false,
            requesterId: 'yt-player'
          });
        } else {
          stopVideo({
            url: mediaUrl,
            padId: playerPadId,
            time: player.getCurrentTime()
          });
        }
      }
    };

    const intervalId = setInterval(checkProgress, 100);
    return () => clearInterval(intervalId);
  }, [
    mediaUrl,
    playerPadId,
    stopVideo,
    isLoopedRef,
    startTimeRef,
    endTimeRef,
    seekVideo
  ]);

  return (
    <div ref={containerRef} className='absolute top-0 left-0 w-full h-full' />
  );
};
