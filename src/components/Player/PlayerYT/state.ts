'use client';

import { createLog } from '@helpers/log';
import { Interval } from '@model/types';
import { EnqueueObject, createStore as createXStateStore } from '@xstate/store';
import { PlayerState, PlayerYTState } from './types';

const log = createLog('player/yt/state', ['debug', 'error']);

type PlayRequestedAction = { type: 'playRequested' };

type PlayerStateChangeAction = {
  type: 'playerStateChange';
  state: PlayerState;
  player: YTPlayer;
};
type UpdateIntervalsAction = { type: 'updateIntervals'; intervals: Interval[] };

type YTStoreActions =
  | PlayerStateChangeAction
  | UpdateIntervalsAction
  | PlayRequestedAction;

export type StartQueuingEvent = { type: 'startQueuing'; interval: Interval };
export type ReadyEvent = { type: 'ready'; state: PlayerYTState };
export type NotReadyEvent = { type: 'notReady'; state: PlayerYTState };

type YTStoreEvents = StartQueuingEvent | ReadyEvent | NotReadyEvent;

type YTStoreContext = {
  state: PlayerYTState;
  intervals: Interval[];
  playerId: string;
  intervalIndex: number;
  playerState: PlayerState;
  playRequested: boolean;
};

export const createStore = () => {
  const on = {
    playRequested: (context: YTStoreContext): YTStoreContext => {
      return { ...context, playRequested: true };
    },

    playerStateChange: (
      context: YTStoreContext,
      event: PlayerStateChangeAction,
      enqueue: EnqueueObject<YTStoreEvents>
    ): YTStoreContext => {
      const { state: playerState, player } = event;
      const { state: contextState } = context;

      if (playerState === PlayerState.DESTROYED) {
        enqueue.emit.notReady({ state: context.state });
        return {
          ...context,
          state: PlayerYTState.UNINITIALIZED,
          intervalIndex: -1,
          playRequested: false,
          playerState
        };
      }

      if (playerState === PlayerState.CREATED) {
        if (contextState === PlayerYTState.UNINITIALIZED) {
          enqueue.emit.notReady({ state: context.state });
          return {
            ...context,
            intervalIndex: -1,
            state: PlayerYTState.READY_FOR_CUE,
            playerState,
            playRequested: false
          };
        }
      }

      if (
        contextState === PlayerYTState.READY_FOR_CUE &&
        playerState === PlayerState.CUED
      ) {
        if (context.intervals.length > 0) {
          const newIntervalIndex = context.intervalIndex + 1;
          const interval = context.intervals[newIntervalIndex];

          // check that the interval end is valid
          if (interval.end === -1) {
            log.debug(
              '[playerStateChange] interval end is -1, setting to',
              player.getDuration()
            );
            interval.end = player.getDuration();
          }

          enqueue.emit.startQueuing({
            interval: context.intervals[newIntervalIndex]
          });
          return {
            ...context,
            state: PlayerYTState.CUEING,
            intervalIndex: newIntervalIndex,
            playerState,
            playRequested: false
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
            enqueue.emit.startQueuing({
              interval: context.intervals[newIntervalIndex]
            });
            return {
              ...context,
              state: PlayerYTState.CUEING,
              playerState,
              intervalIndex: newIntervalIndex,
              playRequested: false
            };
          } else {
            // no more intervals to cue, we can declare the player ready
            enqueue.emit.ready({ state: contextState });
            return {
              ...context,
              state: PlayerYTState.READY,
              playerState,
              playRequested: false
            };
          }
        }
      }

      return { ...context, playerState, playRequested: false };
    },
    updateIntervals: (
      context: YTStoreContext,
      event: UpdateIntervalsAction
    ): YTStoreContext => {
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
      context: {} as YTStoreContext,
      events: {} as YTStoreActions,
      emitted: {} as YTStoreEvents
    },
    context: {
      state: PlayerYTState.UNINITIALIZED,
      intervals: [] as Interval[],
      playerId: '',
      intervalIndex: -1,
      playerState: PlayerState.UNSTARTED,
      playRequested: false
    } as YTStoreContext,
    on
  };

  return createXStateStore(content);
};
