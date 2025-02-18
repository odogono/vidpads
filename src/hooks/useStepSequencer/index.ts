'use client';

import { useContext } from 'react';

import { StepSequencerContext } from './context';

export const useStepSequencer = () => {
  const context = useContext(StepSequencerContext);

  if (!context) {
    throw new Error('useStepSequencer not ready');
  }

  return context;
};
