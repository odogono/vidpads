'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { useProject } from '@hooks/useProject';
import { SequencerTimesUpdatedEvent } from '@model/store/types';
import { useSelector } from '@xstate/store/react';
import {
  PlayStartedEvent,
  PlayStoppedEvent,
  RecordStartedEvent,
  TimeUpdateEvent,
  createStore
} from './index';

const log = createLog('seq/useSequencerStore');

export const useSequencerStore = () => {
  const events = useEvents();
  const [store] = useState(() => createStore());
  const animationRef = useRef<number | null>(null);

  const { project: primaryStore } = useProject();
  const primaryStoreStartTime = useSelector(
    primaryStore,
    (state) => state.context.sequencer?.time ?? 0
  );
  const primaryStoreEndTime = useSelector(
    primaryStore,
    (state) => state.context.sequencer?.endTime ?? 0
  );

  const updateTime = useCallback(() => {
    const { playStartedAt, time, endTime, isPlaying, isRecording } =
      store.getSnapshot().context;

    if (!isPlaying && !isRecording) return;
    const now = performance.now();
    const totalElapsedTime = time + (now - playStartedAt);

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
        time: event.time / 1000
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
        time: event.time / 1000,
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
    events.emit('cmd:cancel');
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
      store.send({ type: 'setTime', time: event.time * 1000 });
      // events.emit('seq:time-update', {
      //   time: event.time,
      //   isPlaying: false,
      //   isRecording: false
      // });
    },
    [store]
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
      store.send({ type: 'setTime', time: event.time * 1000 });
    },
    [store]
  );

  handleSequencerTimesUpdated({
    type: 'sequencerTimesUpdated',
    time: primaryStoreStartTime,
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
