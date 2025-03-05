'use client';

import { RefObject, useCallback, useEffect, useState } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { Interval } from '@model/types';
import { PlayerPlay, PlayerPlaying, PlayerStop } from '../types';
import { PlayerStateToString, PlayerYTStateToString } from './helpers';
import { StartQueuingEvent, createStore } from './state';
import { PlayerState, PlayerYTState } from './types';

const log = createLog('player/yt/state', ['debug']);

export interface UsePlayerYTStateProps {
  playEventRef: RefObject<PlayerPlay | undefined>;
  intervals: Interval[];
  mediaUrl: string;
  playerPadId: string;
  playVideo: (props: PlayerPlay) => void;
  stopVideo: (props: PlayerStop) => void;
}

export const usePlayerYTState = ({
  playEventRef,
  intervals,
  mediaUrl,
  playerPadId,
  playVideo
}: UsePlayerYTStateProps) => {
  const [store] = useState(() => createStore());
  const events = useEvents();

  useEffect(() => {
    store.send({ type: 'updateIntervals', intervals });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(intervals), mediaUrl]);

  const handlePlayRequested = useCallback((player: YTPlayer) => {
    store.send({ type: 'playRequested' });
    log.debug('handlePlayRequested', player.odgnId);
  }, []);

  const handlePlayerStateChange = useCallback(
    (playerState: PlayerState, player: YTPlayer) => {
      const snapshot = store.getSnapshot().context;
      const contextState = snapshot.state as PlayerYTState;
      const contextPlayerState = snapshot.playerState as PlayerState;
      log.debug(
        'handlePlayerStateChange',
        player.odgnId,
        PlayerStateToString(playerState),
        'current state',
        PlayerYTStateToString(contextState)
      );
      store.send({
        type: 'playerStateChange',
        state: playerState,
        player
      });

      if (contextState === PlayerYTState.READY) {
        // log.debug(
        //   'playerState',
        //   PlayerStateToString(playerState),
        //   'contextPlayerState',
        //   PlayerStateToString(contextPlayerState),
        //   'playRequested',
        //   snapshot.playRequested
        // );

        if (
          snapshot.playRequested ||
          (playerState === PlayerState.BUFFERING &&
            contextPlayerState !== PlayerState.BUFFERING &&
            contextPlayerState !== PlayerState.PLAYING)
        ) {
          log.debug(
            'player state changed from',
            PlayerStateToString(contextPlayerState),
            'to',
            PlayerStateToString(playerState)
          );
          const event = {
            ...playEventRef.current,
            time: player.getCurrentTime()
          } as PlayerPlaying;
          events.emit('player:playing', event);
        } else if (
          playerState === PlayerState.PAUSED &&
          contextPlayerState !== PlayerState.PAUSED
        ) {
          events.emit('player:stopped', {
            url: mediaUrl,
            padId: playerPadId,
            time: player.getCurrentTime()
          });
        }
      }
    },
    [store, playEventRef, events, mediaUrl, playerPadId]
  );

  const handleStartQueuing = useCallback(
    ({ interval }: StartQueuingEvent) => {
      // log.debug('GO startQueuing', playerPadId, mediaUrl, interval);
      const start = interval.start;
      const end = interval.end;

      playVideo({
        url: mediaUrl,
        padId: playerPadId,
        volume: 0,
        start,
        end: Math.min(start + 0.5, end)
      });
    },
    [mediaUrl, playVideo, playerPadId]
  );

  const handleReady = useCallback(
    ({ state }: { state: PlayerYTState }) => {
      // log.debug('GO ready', playerPadId, mediaUrl);
      events.emit('player:ready', {
        url: mediaUrl,
        padId: playerPadId,
        state
      });
    },
    [mediaUrl, events, playerPadId]
  );

  const handleNotReady = useCallback(
    ({ state }: { state: PlayerYTState }) => {
      // log.debug('GO notReady', playerPadId, mediaUrl, state);
      events.emit('player:not-ready', {
        url: mediaUrl,
        padId: playerPadId,
        state
      });
    },
    [mediaUrl, events, playerPadId]
  );

  useEffect(() => {
    const evtStartQueuing = store.on(
      'startQueuing',
      //@ts-expect-error - wierd xstate type issue
      handleStartQueuing
    );
    const evtReady = store.on(
      'ready',
      //@ts-expect-error - wierd xstate type issue
      handleReady
    );
    const evtNotReady = store.on(
      'notReady',
      //@ts-expect-error - wierd xstate type issue
      handleNotReady
    );
    return () => {
      evtStartQueuing.unsubscribe();
      evtReady.unsubscribe();
      evtNotReady.unsubscribe();
    };
  }, [handleStartQueuing, handleReady, handleNotReady, store]);

  // useEffect(() => {
  //   log.debug('state', PlayerYTStateToString(state));
  // }, [state]);

  return {
    handlePlayerStateChange,
    handlePlayRequested
  };
};

export const isPlayerPlaying = (player: YTPlayer) =>
  player.getPlayerState() === PlayerState.PLAYING;
