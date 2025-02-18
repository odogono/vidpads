import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';

const log = createLog('stepSeq/useStepSequencerEvents', ['debug']);

interface UseStepSequencerEventsProps {
  bpm: number;
  seqEventsStr: string;
  stepToPadIds: string[][];
  isPlaying: boolean;
}

export const useStepSequencerEvents = ({
  bpm,
  seqEventsStr,
  stepToPadIds,
  isPlaying
}: UseStepSequencerEventsProps) => {
  const events = useEvents();
  const [activeStep, setActiveStep] = useState(-1);
  const lastStepRef = useRef(-1);
  const lastPadIdsRef = useRef<string[] | undefined>(undefined);

  // const handleTimeUpdate = useCallback(
  //   (event: { time: number; isPlaying: boolean; isRecording: boolean }) => {
  //     if (!isPlaying) return;

  //     const { time } = event;

  //     const beatsPerSecond = bpm / 60;
  //     const beatsPerStep = beatsPerSecond / 4;
  //     const step = Math.floor(time / beatsPerStep) % 16;

  //     setActiveStep(step);

  //     if (step !== lastStepRef.current) {
  //       log.debug(
  //         'step changed',
  //         { step, lastStep: lastStepRef.current },
  //         stepToPadIds[step]
  //       );

  //       // clear the last padIds
  //       if (lastPadIdsRef.current && lastPadIdsRef.current.length > 0) {
  //         for (const padId of lastPadIdsRef.current) {
  //           // log.debug('pad:touchup', { padId, step });
  //           events.emit('pad:touchup', { padId, source: 'step-seq' });
  //         }
  //       }

  //       const padIds = stepToPadIds[step];
  //       if (padIds && padIds.length > 0) {
  //         for (const padId of padIds) {
  //           // log.debug('pad:touchdown', { padId, step });
  //           events.emit('pad:touchdown', { padId, source: 'step-seq' });
  //         }
  //       }
  //       lastPadIdsRef.current = padIds;
  //     }

  //     lastStepRef.current = step;
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [bpm, seqEventsStr, isPlaying]
  // );

  const handleStopped = useCallback(() => {
    setActiveStep(-1);
    lastStepRef.current = -1;
    lastPadIdsRef.current = undefined;
  }, []);

  useEffect(() => {
    // events.on('seq:time-update', handleTimeUpdate);
    events.on('seq:stopped', handleStopped);
    return () => {
      // events.off('seq:time-update', handleTimeUpdate);
      events.off('seq:stopped', handleStopped);
    };
  }, [events, handleStopped, handleTimeUpdate]);

  return { activeStep };
};
