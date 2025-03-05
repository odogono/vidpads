import { useCallback, useEffect, useRef } from 'react';

import { createLog } from '@helpers/log';
import { MediaYouTube } from '@model/types';
import {
  PlayerPlay,
  PlayerProps,
  PlayerSeek,
  PlayerStop,
  PlayerUpdate
} from '../types';
import { PlayerStateToString } from './helpers';
import { usePlayerYTEvents } from './useEvents';
import { isPlayerPlaying } from './usePlayerYTState';
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
  const playTicketRef = useRef<number>(0);

  // useRenderingTrace('PlayerYT', {
  //   media,
  //   mediaUrl,
  //   playerPadId
  // });

  const playVideo = useCallback(
    (props: PlayerPlay) => {
      const { url, padId, start, end, isLoop, volume, playbackRate, isResume } =
        props;

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
      const currentTime = player.getCurrentTime();

      startTimeRef.current = startTime;
      endTimeRef.current = endTime;
      isLoopedRef.current = isLoop ?? false;

      log.debug('playVideo', player.odgnId, {
        start: startTime,
        end: endTime,
        currentTime,
        isLoop,
        volume: setVolume,
        playbackRate,
        playbackRates: player.getAvailablePlaybackRates(),
        isResume
      });

      onPlayerPlayRequested(player);

      if (setVolume === 0) {
        player.mute();
      } else {
        player.unMute();
        player.setVolume(setVolume);
        player.setPlaybackRate(playbackRate ?? 1);
      }

      playTicketRef.current = performance.now();

      if (isResume) {
        if (currentTime < startTime || currentTime > endTime) {
          player.seekTo(startTime, true);
        }
      } else {
        player.seekTo(startTime, true);
        // log.debug(
        //   'playVideo seekTo',
        //   startTime,
        //   result,
        //   player.getCurrentTime()
        // );
      }
      player.playVideo();

      return [currentTime, player.getDuration()] as PlayerReturn;
    },
    [mediaUrl, playerPadId]
  );

  const stopImmediate = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    player.pauseVideo();
  }, [playerRef]);

  const stopVideo = useCallback(
    ({ url, padId, all }: PlayerStop) => {
      const player = playerRef.current;
      if (!player) return;
      if (!all && url !== mediaUrl) return;
      if (!all && padId !== playerPadId) return;

      const playTicket = performance.now() - playTicketRef.current;

      if (playTicket > 40) {
        // curiously on some browsers, the seekTo does not respond
        // quickly enough, meaning that we can get a stop on the
        // previous play before the seek/play has started.
        // this is a hack to try and prevent that
        // log.debug('[stopVideo]', player.odgnId, {
        //   player,
        //   requestId,
        //   all,
        //   ticket: performance.now() - playTicket,
        //   state: PlayerStateToString(player.getPlayerState())
        // });
        try {
          player.pauseVideo();
        } catch {
          log.debug('[stopVideo] ⚠️ error pausing video');
        }
      }
      return [player.getCurrentTime(), player.getDuration()] as PlayerReturn;
    },
    [mediaUrl, playerPadId]
  );

  const seekVideo = useCallback(
    ({ url, time, padId, requesterId, fromId }: PlayerSeek) => {
      const player = playerRef.current;
      if (!player) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;
      // TODO implement better controll of this property
      // yt recommend that the parameter is set to false while the seek is in progress
      // and then set it to true again after the seek is complete
      // const allowSeekAhead = !inProgress;

      log.debug('[seekVideo]', {
        time,
        requesterId,
        fromId,
        isPlaying: isPlayerPlaying(player)
      });
      if (isPlayerPlaying(player) && fromId !== 'timeline') {
        // log.debug('[seekVideo] no seek while player is playing');
        return;
      }

      try {
        player.seekTo(
          time,
          fromId === 'timeline' || fromId === 'start' || fromId === 'end'
        );
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

  const updatePlayer = useCallback(
    ({ padId, volume, playbackRate, isLoop }: PlayerUpdate) => {
      const player = playerRef.current;
      if (!player) return;
      // if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;

      if (isLoop !== undefined) {
        isLoopedRef.current = isLoop;
        log.debug('updatePlayer', { isLoop });
      }

      if (volume !== undefined) {
        player.setVolume(volume * 100);
      }

      if (playbackRate !== undefined) {
        player.setPlaybackRate(playbackRate);
      }
    },
    [playerPadId]
  );

  // takes care of preparing the player on mount for playback
  const {
    onPlayerCreated,
    onPlayerDestroyed,
    onPlayerReady,
    onPlayerStateChange,
    onPlayerError,
    onPlayerPlayRequested
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
    updatePlayer
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
          onError: onPlayerError as unknown as (event: Error) => void
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

  return (
    <div
      ref={containerRef}
      className='vo-player-yt absolute top-0 left-0 w-full h-full'
    />
  );
};
