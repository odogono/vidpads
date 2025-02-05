import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { usePadDetails } from '@model/hooks/usePads';
import { usePlayerState } from '@model/hooks/usePlayerState';
import {
  PlayerEvent,
  PlayerExtractThumbnail,
  PlayerNotReady,
  PlayerPlay,
  PlayerReady,
  PlayerSeek,
  PlayerSetPlaybackRate,
  PlayerSetVolume,
  PlayerStop
} from '../types';
import type { PlayerReturn } from './index';
import { PlayerState } from './types';
import { usePlayerYTState } from './usePlayerYTState';

const log = createLog('player/yt/events', ['debug']);

type PlayerYTEvents = {
  player: YTPlayer;
  state: PlayerState;
  stateString: string;
};

export type PlayerYTPlay = PlayerPlay;
export type PlayerYTStop = PlayerStop;
export type PlayerYTSeek = PlayerSeek;
export type PlayerYTExtractThumbnail = PlayerExtractThumbnail & PlayerYTEvents;

export interface UsePlayerYTEventsProps {
  mediaUrl: string;
  padId: string;
  isLoopedRef: RefObject<boolean>;
  startTimeRef: RefObject<number>;
  endTimeRef: RefObject<number>;
  playVideo: (props: PlayerYTPlay) => PlayerReturn | undefined;
  stopVideo: (props: PlayerYTStop) => PlayerReturn | undefined;
  seekVideo: (props: PlayerYTSeek) => PlayerReturn | undefined;
  stopImmediate: () => void;
  setVolume: (props: PlayerSetVolume) => void;
  setPlaybackRate: (props: PlayerSetPlaybackRate) => void;
}

export const usePlayerYTEvents = ({
  mediaUrl,
  padId: playerPadId,
  isLoopedRef,
  playVideo,
  stopVideo,
  seekVideo,
  stopImmediate,
  setVolume,
  setPlaybackRate,
  startTimeRef,
  endTimeRef
}: UsePlayerYTEventsProps) => {
  const events = useEvents();
  const { getPadInterval } = usePadDetails(playerPadId);
  const [interval] = useState(() => getPadInterval());
  const isBufferingRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const playEventRef = useRef<PlayerPlay | undefined>(undefined);
  const {
    onPlayerUpdate: cOnPlayerUpdate,
    onPlayerDestroyed: cOnPlayerDestroyed
  } = usePlayerState(playerPadId, mediaUrl);

  const { handlePlayerStateChange } = usePlayerYTState({
    playEventRef,
    intervals: interval ? [interval] : [],
    mediaUrl,
    playerPadId,
    playVideo,
    stopVideo
  });

  const handleEnded = useCallback(
    (player: YTPlayer) => {
      log.debug('ended', mediaUrl);
      if (isLoopedRef.current) {
        playVideo({
          url: mediaUrl,
          padId: playerPadId
        });
      } else {
        stopVideo({
          url: mediaUrl,
          padId: playerPadId,
          time: player.getCurrentTime()
        });
      }
    },
    [isLoopedRef, mediaUrl, playVideo, stopVideo, playerPadId]
  );

  const extractThumbnail = useCallback(
    ({ padId, time, url, additional, requestId }: PlayerExtractThumbnail) => {
      if (padId !== playerPadId) return;
      // sadly, extracting the thumbnail at the current time is not possible
      // with the YouTube API. So the event is emitted anyway to ensure
      // the start and end times are persisted
      events.emit('video:thumbnail-extracted', {
        url,
        time,
        additional,
        padId: playerPadId,
        requestId: `YTPlayer:${requestId}`
      });
    },
    [events, playerPadId]
  );

  const onPlayerCreated = useCallback(
    (player: YTPlayer) => {
      handlePlayerStateChange(PlayerState.CREATED, player);
    },
    [handlePlayerStateChange]
  );

  const onPlayerDestroyed = useCallback(
    (player: YTPlayer) => {
      // log.debug('[onPlayerDestroyed]', player.odgnId);
      handlePlayerStateChange(PlayerState.DESTROYED, player);
      cOnPlayerDestroyed();
    },
    [handlePlayerStateChange, cOnPlayerDestroyed]
  );

  // called when the YTPlayer has indicated it is ready
  const onPlayerReady = useCallback(
    (player: YTPlayer) => {
      const duration = player.getDuration();
      // check the interval end time - its possible that it is invalid
      // and we need to set it to the video duration
      if (interval && interval.end === -1) {
        interval.end = duration;
      }

      log.debug('onPlayerReady duration', duration);

      cOnPlayerUpdate({
        padId: playerPadId,
        mediaUrl,
        duration: duration,
        playbackRates: player.getAvailablePlaybackRates()
      });

      handlePlayerStateChange(player.getPlayerState(), player);
    },
    [interval, cOnPlayerUpdate, playerPadId, mediaUrl, handlePlayerStateChange]
  );

  const updateTimeTracking = useCallback(() => {
    const time = playerRef.current?.getCurrentTime();
    const duration = playerRef.current?.getDuration();
    // log.debug('updateTimeTracking', time, duration);
    if (time !== undefined && duration !== undefined) {
      // handles the oneshot or looped behaviour
      if (time >= endTimeRef.current) {
        if (isLoopedRef.current) {
          // log.debug('[updateTimeTracking] looping', {
          //   time,
          //   endTime: endTimeRef.current
          // });
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
            time
          });
        }
      }

      events.emit('player:time-update', {
        url: mediaUrl,
        padId: playerPadId,
        time,
        duration
      });
    }

    if (animationRef.current !== null) {
      animationRef.current = requestAnimationFrame(updateTimeTracking);
    }
  }, [
    endTimeRef,
    events,
    mediaUrl,
    playerPadId,
    isLoopedRef,
    seekVideo,
    startTimeRef,
    stopVideo
  ]);

  const startTimeTracking = useCallback(
    (player: YTPlayer) => {
      if (animationRef.current !== null) {
        return;
      }
      playerRef.current = player;
      animationRef.current = requestAnimationFrame(updateTimeTracking);
    },
    [updateTimeTracking]
  );

  const stopTimeTracking = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const onPlayerStateChange = useCallback(
    (player: YTPlayer, state: PlayerState) => {
      switch (state) {
        case PlayerState.PLAYING:
          isBufferingRef.current = false;
          break;
        case PlayerState.BUFFERING:
          isBufferingRef.current = true;
          startTimeTracking(player);
          break;
        case PlayerState.PAUSED:
          stopTimeTracking();
          break;
        case PlayerState.ENDED:
          stopTimeTracking();
          handleEnded(player);
          break;
      }

      handlePlayerStateChange(state, player);
    },
    [handleEnded, handlePlayerStateChange, startTimeTracking, stopTimeTracking]
  );

  const onPlayerError = useCallback(
    (error: Error) => {
      log.debug('[onError]', mediaUrl, error);
      stopTimeTracking();
      stopVideo({
        url: mediaUrl,
        padId: playerPadId,
        time: playerRef.current?.getCurrentTime() ?? 0
      });
      // setIsReady(false);
      // cOnPlayerUpdate({ isReady: false });
    },
    [mediaUrl, playerPadId, stopTimeTracking, stopVideo]
  );

  const [isReady, setIsReady] = useState(false);

  const handleReady = useCallback(
    (e: PlayerReady) => {
      if (!doesPlayerEventMatch(e, playerPadId)) return;
      // log.debug('player ready', e);
      setIsReady(true);
      cOnPlayerUpdate({ padId: playerPadId, mediaUrl, isReady: true });
    },
    [playerPadId, cOnPlayerUpdate, mediaUrl]
  );

  const handleNotReady = useCallback(
    (e: PlayerNotReady) => {
      if (!doesPlayerEventMatch(e, playerPadId)) return;
      // log.debug('player not ready?', e);
      setIsReady(false);
      cOnPlayerUpdate({ padId: playerPadId, mediaUrl, isReady: false });
    },
    [playerPadId, cOnPlayerUpdate, mediaUrl]
  );

  const handleSeek = useCallback(
    (e: PlayerSeek) => {
      if (!isReady) return;
      const result = seekVideo(e);
      if (result === undefined) return;
      const [time, duration] = result;
      events.emit('player:time-update', {
        url: mediaUrl,
        padId: playerPadId,
        time,
        duration
      });
    },
    [isReady, seekVideo, mediaUrl, playerPadId, events]
  );

  useEffect(() => {
    // prevent start/stop/seek/... from triggering before the player is ready
    const evtPlayVideo = (e: PlayerPlay) => {
      playEventRef.current = e;
      return isReady ? playVideo(e) : undefined;
    };
    const evtStopVideo = (e: PlayerEvent) =>
      isReady ? stopVideo(e as PlayerStop) : undefined;
    const evtExtractThumbnail = (e: PlayerEvent) =>
      isReady ? extractThumbnail(e as PlayerExtractThumbnail) : undefined;
    const evtStopAll = () => (isReady ? stopImmediate() : undefined);
    const evtSetVolume = (e: PlayerSetVolume) =>
      isReady ? setVolume(e) : undefined;
    const evtSetPlaybackRate = (e: PlayerSetPlaybackRate) =>
      isReady ? setPlaybackRate(e) : undefined;

    events.on('video:start', evtPlayVideo);
    events.on('video:stop', evtStopVideo);
    events.on('player:stop-all', evtStopAll);
    events.on('video:seek', handleSeek);
    events.on('video:extract-thumbnail', evtExtractThumbnail);
    events.on('player:ready', handleReady);
    events.on('player:not-ready', handleNotReady);
    events.on('player:set-volume', evtSetVolume);
    events.on('player:set-playback-rate', evtSetPlaybackRate);
    return () => {
      stopTimeTracking();
      events.off('video:start', evtPlayVideo);
      events.off('video:stop', evtStopVideo);
      events.off('player:stop-all', evtStopAll);
      events.off('video:seek', handleSeek);
      events.off('video:extract-thumbnail', evtExtractThumbnail);
      events.off('player:ready', handleReady);
      events.off('player:not-ready', handleNotReady);
      events.off('player:set-volume', evtSetVolume);
      events.off('player:set-playback-rate', evtSetPlaybackRate);
    };
  }, [
    events,
    extractThumbnail,
    handleNotReady,
    handleReady,
    isReady,
    playVideo,
    seekVideo,
    stopVideo,
    stopTimeTracking,
    stopImmediate,
    handleSeek,
    setVolume,
    setPlaybackRate
  ]);

  return {
    onPlayerCreated,
    onPlayerDestroyed,
    onPlayerReady,
    onPlayerStateChange,
    onPlayerError
  };
};

const doesPlayerEventMatch = (e: PlayerEvent, playerPadId: string) => {
  return e.padId === playerPadId;
};
