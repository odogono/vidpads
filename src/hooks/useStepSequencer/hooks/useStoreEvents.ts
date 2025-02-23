import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { useProject } from '@hooks/useProject';
import { isModeActive } from '@model/helpers';
import {
  SequencerStartedEvent,
  SequencerStoppedEvent
} from '@model/store/types';
import { UseSelectorsResult } from './useSelectors';

const log = createLog('stepSeq/useStoreEvents', ['debug']);

export const useStoreEvents = ({
  bpm,
  stepToPadIds,
  patternStr,
  patternCount
}: UseSelectorsResult) => {
  const { project } = useProject();
  const events = useEvents();
  const animationRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const playStartedAtRef = useRef<number>(0);
  const lastStepRef = useRef(-1);
  const lastPatternIndexRef = useRef(-1);
  const lastPadIdsRef = useRef<string[] | undefined>(undefined);
  const [activeStep, setActiveStep] = useState(-1);

  const padsTouched = useRef(new Set<string>());

  const updateTime = useCallback(() => {
    const now = performance.now();
    const currentTime = (now - playStartedAtRef.current) / 1000;

    const beatsPerSecond = 60 / bpm;
    const beatsPerStep = beatsPerSecond / 4;
    const overallStep = Math.floor(currentTime / beatsPerStep);
    const step = overallStep % 16;
    const pattern = Math.floor(overallStep / 16) % patternCount;

    events.emit('seq:step-update', {
      time: currentTime,
      bpm,
      pattern,
      step
    });

    setActiveStep(step);

    if (step !== lastStepRef.current) {
      log.debug(
        'step changed',
        {
          step,
          lastStep: lastStepRef.current,
          pattern,
          lastPattern: lastPatternIndexRef.current
        },
        stepToPadIds[pattern][step]
      );

      project.send({ type: 'setStepSequencerPatternIndex', index: pattern });

      // clear the last padIds
      if (lastPadIdsRef.current && lastPadIdsRef.current.length > 0) {
        for (const padId of lastPadIdsRef.current) {
          log.debug('pad:touchup', { padId, step });
          events.emit('pad:touchup', { padId, source: 'step-seq' });
          // padsTouched.current.delete(padId);
        }
      }

      const padIds = stepToPadIds[pattern][step];
      if (padIds && padIds.length > 0) {
        for (const padId of padIds) {
          log.debug('pad:touchdown', { padId, step });
          events.emit('pad:touchdown', { padId, source: 'step-seq' });
          padsTouched.current.add(padId);
        }
      }
      lastPadIdsRef.current = padIds;
      lastStepRef.current = step;
      lastPatternIndexRef.current = pattern;
    }

    if (animationRef.current !== null) {
      animationRef.current = requestAnimationFrame(updateTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, isPlaying, isRecording, bpm, patternStr]);

  const handlePlayStarted = useCallback(
    (event: SequencerStartedEvent) => {
      const { isPlaying, isRecording, time, mode } = event;

      if (!isModeActive(mode, 'step')) return;

      log.debug('handlePlayStarted', {
        time
      });

      if (isPlaying) {
        events.emit('seq:play-started', {
          time,
          mode: 'step'
        });
      } else if (isRecording) {
        events.emit('seq:record-started', {
          time,
          mode: 'step'
        });
      }

      setIsPlaying(isPlaying);
      setIsRecording(isRecording);

      playStartedAtRef.current = performance.now();

      animationRef.current = requestAnimationFrame(updateTime);
    },
    [events, updateTime]
  );

  const handleStopped = useCallback(
    ({ mode }: SequencerStoppedEvent) => {
      if (!isModeActive(mode, 'step')) return;
      log.debug('handlePlayStopped');

      if (animationRef.current === null) return;

      // touch up all the pads that were touched
      log.debug('touching up pads', { pads: padsTouched.current });
      for (const padId of padsTouched.current) {
        events.emit('pad:touchup', {
          padId,
          forceStop: true,
          source: 'step-seq'
        });
      }

      padsTouched.current.clear();

      setActiveStep(-1);
      lastStepRef.current = -1;
      lastPadIdsRef.current = undefined;
      lastPatternIndexRef.current = -1;

      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      setIsPlaying(false);
      setIsRecording(false);
      // log.debug('handlePlayStopped', event.time);
    },
    [events]
  );

  // useEffect(() => {
  //   events.emit('seq:time-update', {
  //     time: 0,
  //     endTime: 16,
  //     isPlaying: false,
  //     isRecording: false,
  //     mode: 'step'
  //   });
  // }, [events]);

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

  return { activeStep, isPlaying, isRecording };
};
