import { useCallback, useEffect, useRef } from 'react';

import { OpTimeInputRef } from '@components/common/OpTimeInput';
import { useEvents as useEventsBase } from '@hooks/events';
import {
  PadInteractionEvent,
  StepSequencerTimeUpdateEvent
} from '@hooks/events/types';
import { useShowMode } from '@model/hooks/useShowMode';

interface UseEventsProps {
  isPlaying: boolean;
  patternIndex: number;
  setPatternDisplay: (patternIndex: number, index?: number) => void;
}

export const useEvents = ({
  isPlaying,
  patternIndex,
  setPatternDisplay
}: UseEventsProps) => {
  const events = useEventsBase();
  const { setShowMode } = useShowMode();
  const timeRef = useRef<OpTimeInputRef | null>(null);

  const handlePadEnter = useCallback(
    ({ index }: PadInteractionEvent) => {
      if (isPlaying) return;
      setPatternDisplay(patternIndex, index);
    },
    [isPlaying, patternIndex, setPatternDisplay]
  );

  const handlePadLeave = useCallback(() => {
    if (isPlaying) return;
    setPatternDisplay(patternIndex, -1);
  }, [isPlaying, patternIndex, setPatternDisplay]);

  const handleStepUpdate = useCallback((evt: StepSequencerTimeUpdateEvent) => {
    timeRef.current?.setValue(evt.time);
  }, []);

  useEffect(() => {
    setShowMode('step');
    events.on('pad:enter', handlePadEnter);
    events.on('pad:leave', handlePadLeave);
    events.on('seq:step-update', handleStepUpdate);
    return () => {
      setShowMode('pads');
      events.off('pad:enter', handlePadEnter);
      events.off('pad:leave', handlePadLeave);
      events.off('seq:step-update', handleStepUpdate);
    };
  }, [setShowMode, handlePadEnter, handlePadLeave, events, handleStepUpdate]);

  return { timeRef };
};
