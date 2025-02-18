import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { useProject } from '@hooks/useProject';
import { SequencerStartedEvent } from '@model/store/types';
import { UseSelectorsResult } from './useSelectors';

const log = createLog('stepSeq/useStoreEvents', ['debug']);

export const useStoreEvents = ({
  time,
  endTime,
  isLooped,
  bpm,
  stepToPadIds,
  seqEventsStr
}: UseSelectorsResult) => {
  const { project } = useProject();
  const events = useEvents();
  const animationRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const playStartedAtRef = useRef<number>(0);
  const lastStepRef = useRef(-1);
  const lastPadIdsRef = useRef<string[] | undefined>(undefined);
  const [activeStep, setActiveStep] = useState(-1);

  const updateTime = useCallback(() => {
    // if (!isPlaying && !isRecording) {
    //   return;
    // }
    const now = performance.now();
    const currentTime = time + (now - playStartedAtRef.current) / 1000;

    events.emit('seq:time-update', {
      time: currentTime,
      endTime,
      isPlaying,
      isRecording,
      isStep: true
    });

    const beatsPerSecond = bpm / 60;
    const beatsPerStep = beatsPerSecond / 4;
    const step = Math.floor(currentTime / beatsPerStep) % 16;

    setActiveStep(step);

    if (step !== lastStepRef.current) {
      log.debug(
        'step changed',
        { step, lastStep: lastStepRef.current },
        stepToPadIds[step]
      );

      // clear the last padIds
      if (lastPadIdsRef.current && lastPadIdsRef.current.length > 0) {
        for (const padId of lastPadIdsRef.current) {
          // log.debug('pad:touchup', { padId, step });
          events.emit('pad:touchup', { padId, source: 'step-seq' });
        }
      }

      const padIds = stepToPadIds[step];
      if (padIds && padIds.length > 0) {
        for (const padId of padIds) {
          // log.debug('pad:touchdown', { padId, step });
          events.emit('pad:touchdown', { padId, source: 'step-seq' });
        }
      }
      lastPadIdsRef.current = padIds;
    }

    lastStepRef.current = step;

    if (animationRef.current !== null) {
      animationRef.current = requestAnimationFrame(updateTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, isPlaying, isRecording, endTime, time, bpm, seqEventsStr]);

  const handlePlayStarted = useCallback(
    (event: SequencerStartedEvent) => {
      const { isPlaying, isRecording, time } = event;

      log.debug('handlePlayStarted', {
        time
      });

      if (isPlaying) {
        events.emit('seq:play-started', {
          time
        });
      } else if (isRecording) {
        events.emit('seq:record-started', {
          time
        });
      }

      setIsPlaying(isPlaying);
      setIsRecording(isRecording);

      playStartedAtRef.current = performance.now();

      animationRef.current = requestAnimationFrame(updateTime);
    },
    [events, updateTime]
  );

  const handleStopped = useCallback(() => {
    log.debug('handlePlayStopped');
    if (animationRef.current === null) return;

    // const now = performance.now();
    // const currentTime = time + (now - playStartedAtRef.current) / 1000;

    setActiveStep(-1);
    lastStepRef.current = -1;
    lastPadIdsRef.current = undefined;

    // project.send({ type: 'setSequencerTime', time: currentTime, isStep: true });
    // events.emit('seq:stopped', {
    //   time: currentTime,
    //   isStep: true
    // });

    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    setIsPlaying(false);
    setIsRecording(false);
    // log.debug('handlePlayStopped', event.time);
  }, []);

  useEffect(() => {
    events.emit('seq:time-update', {
      time,
      endTime,
      isPlaying: false,
      isRecording: false,
      isStep: true
    });
  }, [events, time, endTime]);

  useEffect(() => {
    // Reset animation frame when dependencies change
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(updateTime);
    }
  }, [updateTime]);

  useEffect(() => {
    const evtPlayStarted = project.on('sequencerStarted', handlePlayStarted);
    const evtPlayStopped = project.on('sequencerStopped', handleStopped);

    return () => {
      evtPlayStarted.unsubscribe();
      evtPlayStopped.unsubscribe();
    };
  }, [handlePlayStarted, handleStopped, project]);

  return { activeStep, isPlaying, isRecording, time, endTime, isLooped };
};
