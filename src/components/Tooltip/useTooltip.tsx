import { useCallback } from 'react';

import { store } from './store';

export const useTooltip = () => {
  const setToolTip = useCallback((time: number, [x, y]: [number, number]) => {
    store.send({ type: 'setToolTip', time, x, y });
  }, []);

  const hideToolTip = useCallback(() => {
    store.send({ type: 'hideToolTip' });
  }, []);

  return { setToolTip, hideToolTip };
};
