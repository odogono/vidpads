'use client';

import { useEffect } from 'react';

import { useEvents } from '@hooks/events';
import { useStepSequencer } from '@hooks/useStepSequencer';

export const useStepSequencerEvents = () => {
  const events = useEvents();

  const {
    activeStep,
    pattern,
    cutPatternToClipboard,
    copyPatternToClipboard,
    pastePatternFromClipboard
  } = useStepSequencer();

  useEffect(() => {
    events.on('cmd:copy', copyPatternToClipboard);
    events.on('cmd:cut', cutPatternToClipboard);
    events.on('cmd:paste', pastePatternFromClipboard);

    return () => {
      events.off('cmd:copy', copyPatternToClipboard);
      events.off('cmd:cut', cutPatternToClipboard);
      events.off('cmd:paste', pastePatternFromClipboard);
    };
  }, [
    copyPatternToClipboard,
    cutPatternToClipboard,
    events,
    pastePatternFromClipboard
  ]);

  return {
    activeStep,
    pattern
  };
};
