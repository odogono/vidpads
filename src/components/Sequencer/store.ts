'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { createStore as createXStateStore } from '@xstate/store';

const log = createLog('seq/state');

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

type TimeSetEvent = {
  type: 'timeSet';
  time: number;
};

type SeqEmittedEvents =
  | PlayStartedEvent
  | PlayStoppedEvent
  | TimeUpdateEvent
  | RecordStartedEvent
  | TimeSetEvent;
type Emit = { emit: (event: SeqEmittedEvents) => void };

interface SeqStoreContext {
  startTime: number;
  elapsedTime: number;
  isRecording: boolean;
  isPlaying: boolean;
}

const onHandlers = {
  play: (context: SeqStoreContext, action: PlayAction, { emit }: Emit) => {
    const { isPlaying, isRecording, elapsedTime } = context;
    if (isPlaying || isRecording) return context;
    emit({ type: 'playStarted', time: elapsedTime });
    log.debug('play', elapsedTime);
    return {
      ...context,
      startTime: performance.now(),
      isPlaying: true
    };
  },
  stop: (context: SeqStoreContext, action: StopAction, { emit }: Emit) => {
    const { startTime, elapsedTime } = context;
    const totalElapsedTime = elapsedTime + (performance.now() - startTime);
    emit({ type: 'playStopped', time: totalElapsedTime });
    log.debug('stop', totalElapsedTime);
    return {
      ...context,
      elapsedTime: totalElapsedTime,
      isPlaying: false
    };
  },
  record: (context: SeqStoreContext, action: RecordAction, { emit }: Emit) => {
    const now = performance.now();
    emit({ type: 'recordStarted', time: context.elapsedTime });
    return {
      ...context,
      startTime: now,
      isPlaying: false,
      isRecording: true
    };
  },
  rewind: (context: SeqStoreContext, action: RewindAction, { emit }: Emit) => {
    // const elapsedTime = performance.now() - context.startTime;
    emit({ type: 'timeUpdate', time: 0 });
    emit({ type: 'timeSet', time: 0 });
    return {
      ...context,
      elapsedTime: 0,
      startTime: performance.now()
    };
  },
  timeUpdate: (context: SeqStoreContext, action: TimeUpdateAction) => {
    return context;
  }
};

const content = {
  types: {
    context: {} as SeqStoreContext,
    events: {} as Actions,
    emitted: {} as SeqEmittedEvents
  },
  context: {
    startTime: 0,
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

  // const time = useSelector(store, (state) => state.context.time);

  const updateTime = useCallback(() => {
    const time = performance.now();
    const { startTime, elapsedTime } = store.getSnapshot().context;
    const totalElapsedTime = elapsedTime + (time - startTime);

    store.send({ type: 'timeUpdate', time: totalElapsedTime });

    events.emit('seq:time-update', {
      time: totalElapsedTime / 1000
    });

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

      log.debug('handlePlayStarted', event.time);
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

      log.debug('handlePlayStopped', event.time);
    },
    [events]
  );

  const handleRecordStarted = useCallback(
    (event: RecordStartedEvent) => {
      events.emit('seq:record-started', {
        time: event.time
      });

      animationRef.current = requestAnimationFrame(updateTime);

      log.debug('handleRecordStarted', event.time);
    },
    [events, updateTime]
  );

  const handleTimeSet = useCallback(
    (event: TimeSetEvent) => {
      events.emit('seq:time-set', {
        time: event.time
      });
    },
    [events]
  );

  const handleTimeUpdate = useCallback(
    (event: TimeUpdateEvent) => {
      events.emit('seq:time-update', {
        time: event.time
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

  useEffect(() => {
    events.on('seq:play', handlePlay);
    events.on('seq:play-toggle', handlePlayToggle);
    events.on('seq:stop', handleStop);
    events.on('seq:record', handleRecord);
    events.on('seq:rewind', handleRewind);

    const evtPlayStarted = store.on('playStarted', handlePlayStarted);
    const evtPlayStopped = store.on('playStopped', handlePlayStopped);
    const evtRecordStarted = store.on('recordStarted', handleRecordStarted);
    const evtTimeUpdate = store.on('timeUpdate', handleTimeUpdate);
    const evtTimeSet = store.on('timeSet', handleTimeSet);

    handleTimeSet({ type: 'timeSet', time: 0 });

    return () => {
      events.off('seq:play', handlePlay);
      events.off('seq:play-toggle', handlePlayToggle);
      events.off('seq:stop', handleStop);
      events.off('seq:record', handleRecord);
      events.off('seq:rewind', handleRewind);
      evtTimeUpdate.unsubscribe();
      evtPlayStarted.unsubscribe();
      evtPlayStopped.unsubscribe();
      evtRecordStarted.unsubscribe();
      evtTimeSet.unsubscribe();
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
    handleTimeSet,
    store
  ]);

  return store;
};
