'use client';

import { useCallback, useEffect, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { Interval, Media } from '@model/types';
import { createStore as createXStateStore } from '@xstate/store';
import { PlayerPlay, PlayerStop } from '../types';
import { PlayerStateToString, PlayerYTStateToString } from './helpers';
import { PlayerState, PlayerYTState } from './types';

const log = createLog('player/yt/state');

type PlayerStateChangeAction = {
  type: 'playerStateChange';
  state: PlayerState;
  playerId: string;
};
type UpdateIntervalsAction = { type: 'updateIntervals'; intervals: Interval[] };

type Actions = PlayerStateChangeAction | UpdateIntervalsAction;

type StartQueuingEvent = { type: 'startQueuing'; interval: Interval };
type ReadyEvent = { type: 'ready'; state: PlayerYTState };
type NotReadyEvent = { type: 'notReady'; state: PlayerYTState };

type EmittedEvents = StartQueuingEvent | ReadyEvent | NotReadyEvent;
type StoreContext = {
  state: PlayerYTState;
  intervals: Interval[];
  playerId: string;
  intervalIndex: number;
};

const createStore = () => {
  return createXStateStore({
    types: {
      context: {} as StoreContext,
      events: {} as Actions,
      emitted: {} as EmittedEvents
    },
    context: {
      state: PlayerYTState.UNINITIALIZED,
      intervals: [],
      playerId: '',
      intervalIndex: -1
    },
    on: {
      playerStateChange: (
        context: StoreContext,
        event: PlayerStateChangeAction,
        { emit }: { emit: (event: EmittedEvents) => void }
      ): StoreContext => {
        const { state: playerState, playerId } = event;

        if (playerState === PlayerState.DESTROYED) {
          emit({ type: 'notReady', state: context.state });
          return {
            ...context,
            state: PlayerYTState.UNINITIALIZED,
            intervalIndex: -1
            // intervals: []
          };
        }

        if (playerState === PlayerState.CREATED) {
          if (context.state === PlayerYTState.UNINITIALIZED) {
            emit({ type: 'notReady', state: context.state });
            return {
              ...context,
              intervalIndex: -1,
              state: PlayerYTState.READY_FOR_CUE
            };
          }
        }

        if (
          context.state === PlayerYTState.READY_FOR_CUE &&
          playerState === PlayerState.CUED
        ) {
          log.debug('we have ', context.intervals.length, 'intervals');
          if (context.intervals.length > 0) {
            const newIntervalIndex = context.intervalIndex + 1;
            emit({
              type: 'startQueuing',
              interval: context.intervals[newIntervalIndex]
            });
            return {
              ...context,
              state: PlayerYTState.CUEING,
              intervalIndex: newIntervalIndex
            };
          } else {
            // no intervals to cue, so wait for them
            log.debug('no intervals to cue');
          }
        }

        if (context.state === PlayerYTState.CUEING) {
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
                intervalIndex: newIntervalIndex
              };
            } else {
              // no more intervals to cue, we can declare the player ready
              emit({ type: 'ready', state: context.state });
              return {
                ...context,
                state: PlayerYTState.READY
              };
            }
          }
        }

        // context.state = event.state;
        // log.debug('playerStateChange', PlayerStateToString(state));
        return context;
      },
      updateIntervals: (
        context: StoreContext,
        event: UpdateIntervalsAction
      ): StoreContext => {
        if (
          context.state === PlayerYTState.READY_FOR_CUE ||
          context.state === PlayerYTState.UNINITIALIZED
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
    }
  });
};

export interface UsePlayerYTStateProps {
  intervals: Interval[];
  media: Media;
  playVideo: (props: PlayerPlay) => void;
  stopVideo: (props: PlayerStop) => void;
}

export const usePlayerYTState = ({
  intervals,
  media,
  playVideo,
  stopVideo
}: UsePlayerYTStateProps) => {
  const [store] = useState(() => createStore());
  const mediaUrl = media.url;
  const events = useEvents();

  useEffect(() => {
    log.debug('[useEffect] updateIntervals?', intervals);
    store.send({ type: 'updateIntervals', intervals });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(intervals), mediaUrl]);

  const handlePlayerStateChange = useCallback(
    (playerState: PlayerState, playerId: string) => {
      const state = store.getSnapshot().context.state;
      log.debug(
        'handlePlayerStateChange',
        playerId,
        PlayerStateToString(playerState),
        'current state',
        PlayerYTStateToString(state)
      );
      store.send({ type: 'playerStateChange', state: playerState, playerId });
    },
    [store]
  );

  const handleStartQueuing = useCallback(
    ({ interval }: StartQueuingEvent) => {
      log.debug('GO startQueuing', mediaUrl, interval);
      const start = interval.start;
      const end = interval.end;

      playVideo({
        url: mediaUrl,
        volume: 0,
        start,
        end: Math.min(start + 1, end)
      });
    },
    [mediaUrl, playVideo]
  );

  const handleReady = useCallback(
    ({ state }: { state: PlayerYTState }) => {
      log.debug('GO ready', mediaUrl);
      events.emit('player:ready', {
        url: mediaUrl,
        state
      });
    },
    [mediaUrl, events]
  );

  const handleNotReady = useCallback(
    ({ state }: { state: PlayerYTState }) => {
      log.debug('GO notReady', mediaUrl, state);
      events.emit('player:not-ready', {
        url: mediaUrl,
        state
      });
    },
    [mediaUrl, events]
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
