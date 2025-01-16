import { RefObject, useCallback, useEffect } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { Interval } from '@model/types';
import {
  PlayerExtractThumbnail,
  PlayerPlay,
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

  return {
    onPlayerCreated,
    onPlayerDestroyed,
    onPlayerReady,
    onPlayerStateChange,
    onPlayerError
  };
};
