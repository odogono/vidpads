'use client';

import { useCallback, useEffect, useState } from 'react';

import { createLog } from '@helpers/log';
import { Interval, Media } from '@model/types';
import { createStore as createXStateStore } from '@xstate/store';
import { useSelector } from '@xstate/store/react';
import { PlayerPlay, PlayerStop } from '../types';
import { PlayerStateToString } from './helpers';
import { PlayerState, PlayerYTState } from './types';
import { PlayerYTPlay } from './useEvents';

const log = createLog('player/yt/state');

type PlayerStateChangeAction = {
  type: 'playerStateChange';
  state: PlayerState;
};
type UpdateIntervalsAction = { type: 'updateIntervals'; intervals: Interval[] };

type Actions = PlayerStateChangeAction | UpdateIntervalsAction;

type StartQueuingEvent = { type: 'startQueuing'; intervals: Interval[] };

type EmittedEvents = StartQueuingEvent;
type StoreContext = {
  state: PlayerYTState;
  intervals: Interval[];
};

const createStore = () => {
  return createXStateStore({
    types: {
      context: {} as StoreContext,
      events: {} as Actions,
      emitted: {} as EmittedEvents
    },
    context: {
      state: PlayerYTState.UNINITIALIZED
      // intervals: []
    },
    on: {
      playerStateChange: (
        context: StoreContext,
        event: PlayerStateChangeAction,
        { emit }: { emit: (event: EmittedEvents) => void }
      ): StoreContext => {
        const { state } = event;

        if (
          context.state === PlayerYTState.READY_FOR_CUE &&
          state === PlayerState.CUED
        ) {
          emit({ type: 'startQueuing', intervals: context.intervals });
          return {
            ...context,
            state: PlayerYTState.CUEING
          };
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
            state: PlayerYTState.READY_FOR_CUE
          };
        }
        return context;
      }
    }
  });
};

// the state begins in PlayerYTState.UNINITIALIZED
// when the player sends a CUED state, the state changes to PlayerYTState.READY_FOR_CUE
// when intervals are received, the state changes to PlayerYTState.CUEING
// the intervals are sent to seek the player
// once the intervals have been processed, the state changes to PlayerYTState.READY
// at this point an event is sent and the player becomes visible and ready to play

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
  const state = useSelector(store, (state) => state.context.state);

  useEffect(() => {
    store.send({ type: 'updateIntervals', intervals });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(intervals), media.url]);

  const handlePlayerStateChange = useCallback(
    (state: PlayerState) => {
      log.debug('handlePlayerStateChange', PlayerStateToString(state));
      store.send({ type: 'playerStateChange', state });
    },
    [store]
  );

  const handleStartQueuing = useCallback(
    ({ intervals }: StartQueuingEvent) => {
      log.debug('GO startQueuing', media.url, intervals);
      const start = intervals[0].start;
      // const end = intervals[0].end;

      playVideo({
        url: media.url,
        volume: 0,
        start,
        end: start + 1
      });

      setTimeout(() => {
        stopVideo({ url: media.url });
      }, 1000);
    },
    [media.url, playVideo, stopVideo]
  );

  useEffect(() => {
    const evtStartQueuing = store.on('startQueuing', handleStartQueuing);
    return () => {
      evtStartQueuing.unsubscribe();
    };
  }, [handleStartQueuing, store]);

  log.debug('state', state);

  return {
    handlePlayerStateChange
  };
};
