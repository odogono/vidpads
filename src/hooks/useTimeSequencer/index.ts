'use client';

import { useContext } from 'react';

import { TimeSequencerContext } from './context';

export const useTimeSequencer = () => {
  const context = useContext(TimeSequencerContext);

  if (!context) {
    throw new Error('useTimeSequencer not ready');
  }

  return context;
};
