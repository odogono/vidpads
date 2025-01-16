import { RefObject, useCallback, useEffect, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { Interval } from '@model/types';
import {
  PlayerEvent,
  PlayerExtractThumbnail,
  PlayerNotReady,
  PlayerPlay,
  PlayerReady,
  PlayerSeek,
  PlayerStop
} from '../types';
import { usePlayerYTState } from './state';
import { PlayerState } from './types';

const log = createLog('player/yt/events');

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
  interval: Interval;
  mediaUrl: string;
  padId: string;
  isLoopedRef: RefObject<boolean>;
  startTimeRef: RefObject<number>;
  endTimeRef: RefObject<number>;
  playVideo: (props: PlayerYTPlay) => void;
  stopVideo: (props: PlayerYTStop) => void;
  seekVideo: (props: PlayerYTSeek) => void;
}

export const usePlayerYTEvents = ({
  interval,
  mediaUrl,
  padId: playerPadId,
  isLoopedRef,
  playVideo,
  stopVideo,
  seekVideo
}: UsePlayerYTEventsProps) => {
  const events = useEvents();

  const { handlePlayerStateChange } = usePlayerYTState({
    intervals: [interval],
    mediaUrl,
    playerPadId,
    playVideo,
    stopVideo
  });

  const handleEnded = useCallback(() => {
    log.debug('ended', mediaUrl);
    if (isLoopedRef.current) {
      playVideo({
        url: mediaUrl,
        padId: playerPadId
      });
    } else {
      stopVideo({ url: mediaUrl, padId: playerPadId });
    }
  }, [isLoopedRef, mediaUrl, playVideo, stopVideo, playerPadId]);

  const extractThumbnail = useCallback(
    ({ time, url, additional }: PlayerExtractThumbnail) => {
      // sadly, extracting the thumbnail at the current time is not possible
      // with the YouTube API. So the event is emitted anyway to ensure
      // the start and end times are persisted
      events.emit('video:thumbnail-extracted', {
        url,
        time,
        additional,
        padId: playerPadId
      });
    },
    [events, playerPadId]
  );

  const onPlayerCreated = useCallback(
    (player: YTPlayer) => {
      // log.debug('[onPlayerCreated]', player.odgnId);
      handlePlayerStateChange(PlayerState.CREATED, player);
    },
    [handlePlayerStateChange]
  );

  const onPlayerDestroyed = useCallback(
    (player: YTPlayer) => {
      // log.debug('[onPlayerDestroyed]', player.odgnId);
      handlePlayerStateChange(PlayerState.DESTROYED, player);
    },
    [handlePlayerStateChange]
  );

  // called when the YTPlayer has indicated it is ready
  const onPlayerReady = useCallback(
    (player: YTPlayer) => {
      handlePlayerStateChange(player.getPlayerState(), player);
    },
    [handlePlayerStateChange]
  );

  const onPlayerStateChange = useCallback(
    (player: YTPlayer, state: PlayerState) => {
      if (state === PlayerState.ENDED) {
        handleEnded();
      }

      handlePlayerStateChange(state, player);
    },
    [handleEnded, handlePlayerStateChange]
  );

  const onPlayerError = useCallback(
    (error: Error) => {
      log.error('[onError]', mediaUrl, error);
    },
    [mediaUrl]
  );

  const [isReady, setIsReady] = useState(false);

  const handleReady = useCallback(
    (e: PlayerReady) => {
      if (!doesPlayerEventMatch(e, playerPadId)) return;
      log.debug('player ready', e);
      setIsReady(true);
    },
    [playerPadId]
  );

  const handleNotReady = useCallback(
    (e: PlayerNotReady) => {
      if (!doesPlayerEventMatch(e, playerPadId)) return;
      log.debug('player not ready?', e);
      setIsReady(false);
    },
    [playerPadId]
  );

  useEffect(() => {
    // prevent start/stop/seek/... from triggering before the player is ready
    const evtPlayVideo = (e: PlayerEvent) =>
      isReady ? playVideo(e as PlayerPlay) : undefined;
    const evtStopVideo = (e: PlayerEvent) =>
      isReady ? stopVideo(e as PlayerStop) : undefined;
    const evtSeekVideo = (e: PlayerEvent) =>
      isReady ? seekVideo(e as PlayerSeek) : undefined;
    const evtExtractThumbnail = (e: PlayerEvent) =>
      isReady ? extractThumbnail(e as PlayerExtractThumbnail) : undefined;

    events.on('video:start', evtPlayVideo);
    events.on('video:stop', evtStopVideo);
    events.on('video:seek', evtSeekVideo);
    events.on('video:extract-thumbnail', evtExtractThumbnail);
    events.on('player:ready', handleReady);
    events.on('player:not-ready', handleNotReady);
    return () => {
      events.off('video:start', evtPlayVideo);
      events.off('video:stop', evtStopVideo);
      events.off('video:seek', evtSeekVideo);
      events.off('video:extract-thumbnail', evtExtractThumbnail);
      events.off('player:ready', handleReady);
      events.off('player:not-ready', handleNotReady);
    };
  }, [
    events,
    extractThumbnail,
    handleNotReady,
    handleReady,
    isReady,
    playVideo,
    seekVideo,
    stopVideo
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
