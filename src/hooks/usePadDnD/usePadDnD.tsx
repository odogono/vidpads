import { useContext } from 'react';

import { PadDnDContext } from './context';

export const usePadDnD = () => {
  const context = useContext(PadDnDContext);
  if (context === undefined) {
    throw new Error('usePadDnDContext must be used within a PadDnDProvider');
  }
  return context;
};
