import { useContext } from 'react';

import { StoreContext } from './context';

export const useStore = () => {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error('useStore not ready');
  }

  return context;
};
