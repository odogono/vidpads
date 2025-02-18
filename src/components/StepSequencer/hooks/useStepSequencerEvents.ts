import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';

const log = createLog('stepSeq/useStepSequencerEvents');

interface UseStepSequencerEventsProps {
  bpm: number;
}

export const useStepSequencerEvents = ({
  bpm
}: UseStepSequencerEventsProps) => {
  const events = useEvents();
  const [activeStep, setActiveStep] = useState(-1);

  const handleTimeUpdate = useCallback(
    (event: { time: number; isPlaying: boolean; isRecording: boolean }) => {
      const { time } = event;

      const beatsPerSecond = bpm / 60;
      const beatsPerStep = beatsPerSecond / 4;
      const step = Math.floor(time / beatsPerStep) % 16;

      setActiveStep(step);
    },
    [bpm]
  );

  useEffect(() => {
    events.on('seq:time-update', handleTimeUpdate);
    return () => {
      events.off('seq:time-update', handleTimeUpdate);
    };
  }, [events, handleTimeUpdate]);

  return { activeStep };
};
