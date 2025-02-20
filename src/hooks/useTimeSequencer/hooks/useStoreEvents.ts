import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { secondsToPixels } from '@helpers/time';
import { findTriggerEventsWithinTimeRange } from '@helpers/triggerTree';
import { useEvents } from '@hooks/events';
import { useProject } from '@hooks/useProject';
import { isModeActive } from '@model/helpers';
import {
  SequencerStartedEvent,
  SequencerStoppedEvent,
  SequencerTimesUpdatedEvent
} from '@model/store/types';
import { UseSelectorsResult } from './useSelectors';
import { useTriggerTree } from './useTriggerTree';

const log = createLog('timeSeq/useStoreEvents', ['debug']);

export const useStoreEvents = ({
  bpm,
  canvasBpm,
  pixelsPerBeat,
  time,
  endTime,
  isLooped,
  seqEvents,
  seqEventIds
}: UseSelectorsResult) => {
  const { project } = useProject();
  const events = useEvents();
  const animationRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const playStartedAtRef = useRef<number>(0);
  const lastTimeUpdate = useRef(0);

  const { triggerTree } = useTriggerTree({
    bpm,
    pixelsPerBeat,
    canvasBpm,
    seqEvents,
    seqEventIds
  });

  const updateTime = useCallback(() => {
    const now = performance.now();
    const currentTime = time + (now - playStartedAtRef.current) / 1000;

    const playHeadPosition = secondsToPixels(currentTime, pixelsPerBeat, bpm);

    if (isPlaying || isRecording) {
      // emit an update event so that any events which
      // are being recorded can update their dimensions
      events.emit('seq:playhead-update', {
        time: currentTime,
        playHeadX: playHeadPosition,
        isPlaying,
        isRecording,
        mode: 'time'
      });
      // begin firing events
      // get all of the events between the last time this was called
      // and the current time
      const startTime = Math.min(currentTime, lastTimeUpdate.current);
      const endTime = Math.max(currentTime, lastTimeUpdate.current);
      const rangeEvents = findTriggerEventsWithinTimeRange(
        triggerTree,
        startTime,
        endTime
      );
      // log.debug(
      //   'rangeEvents',
      //   { startTime, endTime, lastTime: lastTimeUpdate.current },
      //   rangeEvents
      // );
      for (const event of rangeEvents) {
        events.emit(event.event, {
          padId: event.padId,
          source: 'sequencer',
          forceStop: true,
          requestId: 'sequencer-time-update'
        });
      }
      // end firing events
    }
    lastTimeUpdate.current = currentTime;

    // events.emit('seq:time-update', {
    //   time: currentTime,
    //   endTime,
    //   isPlaying,
    //   isRecording,
    //   mode: 'time'
    // });

    if (currentTime >= endTime) {
      log.debug({
        time,
        currentTime,
        endTime,
        isLooped
      });
      if (isLooped) {
        project.send({ type: 'rewindSequencer', mode: 'time' });
        // timeRef.current = 0;
        playStartedAtRef.current = now;
        lastTimeUpdate.current = 0;
      } else {
        project.send({ type: 'stopSequencer', mode: 'time' });
      }
    }

    if (animationRef.current !== null) {
      animationRef.current = requestAnimationFrame(updateTime);
    }
  }, [
    time,
    pixelsPerBeat,
    bpm,
    isPlaying,
    isRecording,
    endTime,
    events,
    triggerTree,
    isLooped,
    project
  ]);

  const handlePlayStarted = useCallback(
    (event: SequencerStartedEvent) => {
      const { isPlaying, isRecording, time, mode } = event;

      if (!isModeActive(mode, 'time')) return;

      log.debug('handlePlayStarted', {
        time
      });

      if (isPlaying) {
        events.emit('seq:play-started', {
          time,
          mode: 'time'
        });
      } else if (isRecording) {
        events.emit('seq:record-started', {
          time,
          mode: 'time'
        });
      }

      setIsPlaying(isPlaying);
      setIsRecording(isRecording);

      playStartedAtRef.current = performance.now();
      lastTimeUpdate.current = time;

      animationRef.current = requestAnimationFrame(updateTime);
    },
    [events, updateTime]
  );

  const handleStopped = useCallback(
    ({ mode }: SequencerStoppedEvent) => {
      if (mode !== 'time' && mode !== 'all') return;
      log.debug('handlePlayStopped');
      if (animationRef.current === null) return;

      const now = performance.now();
      const currentTime = time + (now - playStartedAtRef.current) / 1000;
      lastTimeUpdate.current = currentTime;

      project.send({
        type: 'setSequencerTime',
        time: currentTime,
        mode: 'time'
      });
      events.emit('seq:stopped', {
        time: currentTime,
        mode: 'time'
      });

      // stop all players
      // TODO should only stop active players
      events.emit('video:stop', {
        url: '',
        padId: '',
        all: true,
        time: 0,
        requestId: 'sequencer-stopped'
      });

      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      setIsPlaying(false);
      setIsRecording(false);
      // log.debug('handlePlayStopped', event.time);
    },
    [events, project, time]
  );

  const handleTimeUpdated = useCallback(
    (event: SequencerTimesUpdatedEvent) => {
      const { time, mode } = event;
      if (mode !== 'time' && mode !== 'all') return;
      const playHeadPosition = secondsToPixels(time, pixelsPerBeat, bpm);
      events.emit('seq:playhead-update', {
        time,
        playHeadX: playHeadPosition,
        isPlaying,
        isRecording,
        mode: 'time'
      });
    },
    [events, isPlaying, isRecording, pixelsPerBeat, bpm]
  );

  useEffect(() => {
    const playHeadPosition = secondsToPixels(time, pixelsPerBeat, bpm);
    events.emit('seq:playhead-update', {
      time,
      playHeadX: playHeadPosition,
      isPlaying,
      isRecording,
      mode: 'time'
    });
  }, [events, time, endTime, isPlaying, isRecording, pixelsPerBeat, bpm]);

  useEffect(() => {
    // Reset animation frame when dependencies change
    if (animationRef.current !== null) {
      log.debug('reset animation frame');
      cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(updateTime);
    }
  }, [updateTime]);

  useEffect(() => {
    const evtPlayStarted = project.on('sequencerStarted', handlePlayStarted);
    const evtPlayStopped = project.on('sequencerStopped', handleStopped);
    const evtTimeUpdated = project.on(
      'sequencerTimesUpdated',
      handleTimeUpdated
    );

    return () => {
      evtPlayStarted.unsubscribe();
      evtPlayStopped.unsubscribe();
      evtTimeUpdated.unsubscribe();
    };
  }, [handlePlayStarted, handleStopped, handleTimeUpdated, project]);

  return { isPlaying, isRecording, time, endTime, isLooped };
};
