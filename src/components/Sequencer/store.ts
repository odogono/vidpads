'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { createStore as createXStateStore } from '@xstate/store';
import { useSelector } from '@xstate/store/react';
import { useProject } from '../../hooks/useProject';
import { SequencerTimesUpdatedEvent } from '../../model/store/types';

const log = createLog('seq/state', ['debug']);

type PlayAction = {
  type: 'play';
};

type StopAction = {
  type: 'stop';
};

type RecordAction = {
  type: 'record';
};

type RewindAction = {
  type: 'rewind';
};

type TimeUpdateAction = {
  type: 'timeUpdate';
  time: number;
};

type Actions =
  | PlayAction
  | StopAction
  | RecordAction
  | RewindAction
  | TimeUpdateAction;

type PlayStartedEvent = {
  type: 'playStarted';
  time: number;
};

type PlayStoppedEvent = {
  type: 'playStopped';
  time: number;
};

type RecordStartedEvent = {
  type: 'recordStarted';
  time: number;
};

type TimeUpdateEvent = {
  type: 'timeUpdate';
  time: number;
};

type SetEndTimeEvent = {
  type: 'setEndTime';
  time: number; // in ms
};

type SetStartTimeEvent = {
  type: 'setStartTime';
  time: number; // in ms
};

type SetElapsedTimeEvent = {
  type: 'setElapsedTime';
  time: number; // in ms
};

type SeqEmittedEvents =
  | PlayStartedEvent
  | PlayStoppedEvent
  | TimeUpdateEvent
  | RecordStartedEvent
  | SetEndTimeEvent
  | SetStartTimeEvent
  | SetElapsedTimeEvent;
type Emit = { emit: (event: SeqEmittedEvents) => void };

interface SeqStoreContext {
  // time in ms when the sequence started playing/recording
  playStartedAt: number;

  // time when the sequence starts
  startTime: number;

  // time when the sequence ends
  endTime: number;

  // time elapsed since the sequence started playing/recording
  elapsedTime: number;

  // whether the sequence is recording
  isRecording: boolean;

  // whether the sequence is playing
  isPlaying: boolean;
}

const onHandlers = {
  play: (context: SeqStoreContext, action: PlayAction, { emit }: Emit) => {
    const { isPlaying, isRecording, elapsedTime } = context;
    log.debug('play', { isPlaying, isRecording, elapsedTime });
    if (isPlaying || isRecording) return context;
    emit({ type: 'playStarted', time: elapsedTime });
    log.debug('play', elapsedTime, '/', context.endTime);
    return {
      ...context,
      playStartedAt: performance.now(),
      isPlaying: true
    };
  },
  stop: (context: SeqStoreContext, action: StopAction, { emit }: Emit) => {
    const { playStartedAt, elapsedTime } = context;
    const totalElapsedTime = elapsedTime + (performance.now() - playStartedAt);
    emit({ type: 'playStopped', time: totalElapsedTime });
    log.debug('stop', { totalElapsedTime });
    return {
      ...context,
      elapsedTime: totalElapsedTime,
      isPlaying: false,
      isRecording: false
    };
  },
  record: (context: SeqStoreContext, action: RecordAction, { emit }: Emit) => {
    const { isPlaying, isRecording, elapsedTime } = context;
    if (isPlaying || isRecording) return context;
    const now = performance.now();
    emit({ type: 'recordStarted', time: elapsedTime });
    return {
      ...context,
      playStartedAt: now,
      isPlaying: false,
      isRecording: true
    };
  },
  rewind: (context: SeqStoreContext, action: RewindAction, { emit }: Emit) => {
    emit({ type: 'timeUpdate', time: 0 });
    return {
      ...context,
      elapsedTime: 0,
      playStartedAt: performance.now()
    };
  },
  timeUpdate: (context: SeqStoreContext) => {
    // TODO not used
    return context;
  },
  setEndTime: (context: SeqStoreContext, action: SetEndTimeEvent) => {
    // log.debug('setEndTime', action.time);
    return { ...context, endTime: action.time };
  },
  setStartTime: (context: SeqStoreContext, action: SetStartTimeEvent) => {
    // log.debug('setStartTime', action.time);
    return { ...context, startTime: action.time };
  },
  setElapsedTime: (context: SeqStoreContext, action: SetElapsedTimeEvent) => {
    // log.debug('setElapsedTime', action.time, 'was', context.elapsedTime);
    return {
      ...context,
      elapsedTime: action.time,
      playStartedAt: performance.now()
    };
  }
};

const content = {
  types: {
    context: {} as SeqStoreContext,
    events: {} as Actions,
    emitted: {} as SeqEmittedEvents
  },
  context: {
    playStartedAt: 0,
    startTime: 0,
    endTime: 10000,
    elapsedTime: 0,
    isRecording: false,
    isPlaying: false
  } as SeqStoreContext,
  on: onHandlers
};

const createStore = () => {
  return createXStateStore(content);
};

export const useSequencerStore = () => {
  const events = useEvents();
  const [store] = useState(() => createStore());
  const animationRef = useRef<number | null>(null);

  const { project: primaryStore } = useProject();
  const primaryStoreStartTime = useSelector(
    primaryStore,
    (state) => state.context.sequencer?.startTime ?? 0
  );
  const primaryStoreEndTime = useSelector(
    primaryStore,
    (state) => state.context.sequencer?.endTime ?? 0
  );

  // log.debug('primaryStoreStartTime', primaryStoreStartTime);
  // log.debug('primaryStoreEndTime', primaryStoreEndTime);

  const updateTime = useCallback(() => {
    const {
      playStartedAt,
      elapsedTime,
      startTime,
      endTime,
      isPlaying,
      isRecording
    } = store.getSnapshot().context;

    if (!isPlaying && !isRecording) return;
    const time = performance.now();
    const totalElapsedTime = elapsedTime + (time - playStartedAt) + startTime;

    // log.debug('updateTime >= endTime', {
    //   playStartedAt,
    //   totalElapsedTime,
    //   elapsedTime,
    //   endTime
    // });
    events.emit('seq:time-update', {
      time: totalElapsedTime / 1000,
      isPlaying,
      isRecording
    });

    if (totalElapsedTime >= endTime) {
      store.send({ type: 'stop' });
    }

    // log.debug('updateTime', time);

    if (animationRef.current !== null) {
      animationRef.current = requestAnimationFrame(updateTime);
    }
  }, [events, store]);

  // store handlers

  const handlePlayStarted = useCallback(
    (event: PlayStartedEvent) => {
      events.emit('seq:play-started', {
        time: event.time
      });

      animationRef.current = requestAnimationFrame(updateTime);
      updateTime();

      // log.debug('handlePlayStarted', event.time);
    },
    [events, updateTime]
  );

  const handlePlayStopped = useCallback(
    (event: PlayStoppedEvent) => {
      log.debug('handlePlayStopped', event.time);
      if (animationRef.current === null) return;
      events.emit('seq:stopped', {
        time: event.time
      });

      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;

      // log.debug('handlePlayStopped', event.time);
    },
    [events]
  );

  const handleRecordStarted = useCallback(
    (event: RecordStartedEvent) => {
      events.emit('seq:record-started', {
        time: event.time
      });

      animationRef.current = requestAnimationFrame(updateTime);
      updateTime();

      log.debug('handleRecordStarted', event.time);
    },
    [events, updateTime]
  );

  const handleTimeUpdate = useCallback(
    (event: TimeUpdateEvent) => {
      log.debug('handleTimeUpdate', event.time);
      events.emit('seq:time-update', {
        time: event.time,
        isPlaying: false,
        isRecording: false
      });
    },
    [events]
  );

  // event handlers

  const handlePlay = useCallback(() => {
    store.send({ type: 'play' });
  }, [store]);

  const handlePlayToggle = useCallback(() => {
    const { isPlaying, isRecording } = store.getSnapshot().context;
    if (isPlaying || isRecording) {
      store.send({ type: 'stop' });
    } else {
      store.send({ type: 'play' });
    }
  }, [store]);

  const handleStop = useCallback(() => {
    store.send({ type: 'stop' });
    events.emit('player:stop-all');
  }, [store, events]);

  const handleRecord = useCallback(() => {
    store.send({ type: 'record' });
  }, [store]);

  const handleRewind = useCallback(() => {
    store.send({ type: 'rewind' });
  }, [store]);

  // receives a time in seconds
  const handleSetTime = useCallback(
    (event: { time: number }) => {
      store.send({ type: 'setElapsedTime', time: event.time * 1000 });
      events.emit('seq:time-update', {
        time: event.time,
        isPlaying: false,
        isRecording: false
      });
    },
    [events, store]
  );

  const handleSetEndTime = useCallback(
    (event: { time: number }) => {
      store.send({ type: 'setEndTime', time: event.time * 1000 });
    },
    [store]
  );

  const handleSequencerTimesUpdated = useCallback(
    (event: SequencerTimesUpdatedEvent) => {
      store.send({ type: 'setEndTime', time: event.endTime * 1000 });
      store.send({ type: 'setStartTime', time: event.startTime * 1000 });
    },
    [store]
  );

  handleSequencerTimesUpdated({
    type: 'sequencerTimesUpdated',
    startTime: primaryStoreStartTime,
    endTime: primaryStoreEndTime
  });

  useEffect(() => {
    events.on('seq:play', handlePlay);
    events.on('seq:play-toggle', handlePlayToggle);
    events.on('seq:stop', handleStop);
    events.on('seq:record', handleRecord);
    events.on('seq:rewind', handleRewind);
    events.on('seq:set-end-time', handleSetEndTime);
    events.on('seq:set-time', handleSetTime);

    const evtTimesUpdated = primaryStore.on(
      'sequencerTimesUpdated',
      handleSequencerTimesUpdated
    );

    const evtPlayStarted = store.on('playStarted', handlePlayStarted);
    const evtPlayStopped = store.on('playStopped', handlePlayStopped);
    const evtRecordStarted = store.on('recordStarted', handleRecordStarted);
    const evtTimeUpdate = store.on('timeUpdate', handleTimeUpdate);

    events.emit('seq:time-update', {
      time: primaryStoreStartTime,
      isPlaying: false,
      isRecording: false
    });

    return () => {
      events.off('seq:play', handlePlay);
      events.off('seq:play-toggle', handlePlayToggle);
      events.off('seq:stop', handleStop);
      events.off('seq:record', handleRecord);
      events.off('seq:rewind', handleRewind);
      events.off('seq:set-end-time', handleSetEndTime);
      events.off('seq:set-time', handleSetTime);
      evtTimeUpdate.unsubscribe();
      evtPlayStarted.unsubscribe();
      evtPlayStopped.unsubscribe();
      evtRecordStarted.unsubscribe();
      evtTimesUpdated.unsubscribe();
    };
  }, [
    events,
    handlePlay,
    handlePlayToggle,
    handlePlayStarted,
    handlePlayStopped,
    handleRecord,
    handleRecordStarted,
    handleRewind,
    handleStop,
    handleTimeUpdate,
    handleSetTime,
    store,
    handleSetEndTime,
    handleSequencerTimesUpdated,
    primaryStore,
    updateTime,
    primaryStoreStartTime
  ]);

  return store;
};
