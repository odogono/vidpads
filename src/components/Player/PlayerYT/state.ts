'use client';

import { useCallback, useEffect, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { Interval } from '@model/types';
import { createStore as createXStateStore } from '@xstate/store';
import { PlayerPlay, PlayerStop } from '../types';
import { PlayerStateToString, PlayerYTStateToString } from './helpers';
import { PlayerState, PlayerYTState } from './types';

const log = createLog('player/yt/state');

type PlayerStateChangeAction = {
  type: 'playerStateChange';
  state: PlayerState;
  player: YTPlayer;
};
type UpdateIntervalsAction = { type: 'updateIntervals'; intervals: Interval[] };

type Actions = PlayerStateChangeAction | UpdateIntervalsAction;

type StartQueuingEvent = { type: 'startQueuing'; interval: Interval };
type ReadyEvent = { type: 'ready'; state: PlayerYTState };
type NotReadyEvent = { type: 'notReady'; state: PlayerYTState };

type EmittedEvents = StartQueuingEvent | ReadyEvent | NotReadyEvent;
type Emit = { emit: (event: EmittedEvents) => void };
type StoreContext = {
  state: PlayerYTState;
  intervals: Interval[];
  playerId: string;
  intervalIndex: number;
  playerState: PlayerState;
};

const createStore = () => {
  const on = {
    playerStateChange: (
      context: StoreContext,
      event: PlayerStateChangeAction,
      { emit }: Emit
    ): StoreContext => {
      const { state: playerState, player } = event;
      const { state: contextState } = context;

      if (playerState === PlayerState.DESTROYED) {
        emit({ type: 'notReady', state: context.state });
        return {
          ...context,
          state: PlayerYTState.UNINITIALIZED,
          intervalIndex: -1,
          playerState
        };
      }

      if (playerState === PlayerState.CREATED) {
        if (contextState === PlayerYTState.UNINITIALIZED) {
          emit({ type: 'notReady', state: context.state });
          return {
            ...context,
            intervalIndex: -1,
            state: PlayerYTState.READY_FOR_CUE,
            playerState
          };
        }
      }

      if (
        contextState === PlayerYTState.READY_FOR_CUE &&
        playerState === PlayerState.CUED
      ) {
        // log.debug('we have', context.intervals.length, 'intervals');
        if (context.intervals.length > 0) {
          const newIntervalIndex = context.intervalIndex + 1;
          const interval = context.intervals[newIntervalIndex];
          // log.debug('[playerStateChange] startQueuing player', player);
          // log.debug('[playerStateChange] startQueuing interval', interval);

          // check that the interval end is valid
          if (interval.end === -1) {
            log.debug(
              '[playerStateChange] interval end is -1, setting to',
              player.getDuration()
            );
            interval.end = player.getDuration();
          }

          emit({
            type: 'startQueuing',
            interval: context.intervals[newIntervalIndex]
          });
          return {
            ...context,
            state: PlayerYTState.CUEING,
            intervalIndex: newIntervalIndex,
            playerState
          };
        } else {
          // no intervals to cue, so wait for them
          log.debug('no intervals to cue');
        }
      }

      if (contextState === PlayerYTState.CUEING) {
        if (playerState === PlayerState.PAUSED) {
          if (context.intervalIndex < context.intervals.length - 1) {
            // cue the next interval
            const newIntervalIndex = context.intervalIndex + 1;
            emit({
              type: 'startQueuing',
              interval: context.intervals[newIntervalIndex]
            });
            return {
              ...context,
              state: PlayerYTState.CUEING,
              playerState,
              intervalIndex: newIntervalIndex
            };
          } else {
            // no more intervals to cue, we can declare the player ready
            emit({ type: 'ready', state: contextState });
            return {
              ...context,
              state: PlayerYTState.READY,
              playerState
            };
          }
        }
      }

      return { ...context, playerState };
    },
    updateIntervals: (
      context: StoreContext,
      event: UpdateIntervalsAction
    ): StoreContext => {
      const { state: contextState } = context;
      if (
        contextState === PlayerYTState.READY_FOR_CUE ||
        contextState === PlayerYTState.UNINITIALIZED
      ) {
        return {
          ...context,
          intervals: event.intervals,
          intervalIndex: -1,
          state: PlayerYTState.READY_FOR_CUE
        };
      }
      return context;
    }
  };

  const content = {
    types: {
      context: {} as StoreContext,
      events: {} as Actions,
      emitted: {} as EmittedEvents
    },
    context: {
      state: PlayerYTState.UNINITIALIZED,
      intervals: [],
      playerId: '',
      intervalIndex: -1,
      playerState: PlayerState.UNSTARTED
    },
    on
  };

  return createXStateStore(content);
};

export interface UsePlayerYTStateProps {
  intervals: Interval[];
  mediaUrl: string;
  playerPadId: string;
  playVideo: (props: PlayerPlay) => void;
  stopVideo: (props: PlayerStop) => void;
}

export const usePlayerYTState = ({
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

  const handlePlayerStateChange = useCallback(
    (playerState: PlayerState, player: YTPlayer) => {
      const contextState = store.getSnapshot().context.state as PlayerYTState;
      const contextPlayerState = store.getSnapshot().context
        .playerState as PlayerState;
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
        if (
          playerState === PlayerState.BUFFERING &&
          contextPlayerState !== PlayerState.BUFFERING &&
          contextPlayerState !== PlayerState.PLAYING
        ) {
          log.debug(
            'player state changed from',
            PlayerStateToString(contextPlayerState),
            'to',
            PlayerStateToString(playerState)
          );
          events.emit('player:playing', {
            url: mediaUrl,
            padId: playerPadId,
            time: player.getCurrentTime()
          });
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
    [store, events, mediaUrl, playerPadId]
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
        end: Math.min(start + 1, end)
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
    const evtStartQueuing = store.on('startQueuing', handleStartQueuing);
    const evtReady = store.on('ready', handleReady);
    const evtNotReady = store.on('notReady', handleNotReady);
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
    handlePlayerStateChange
  };
};
