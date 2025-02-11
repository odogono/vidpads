import { useContext } from 'react';

import { MidiContext } from './context';

export const useMidi = () => {
  const context = useContext(MidiContext);
  if (context === undefined) {
    throw new Error('useMidi must be used within a MidiProvider');
  }
  return context;
};
