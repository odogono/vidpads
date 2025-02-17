import { useCallback } from 'react';

import { formatTimeToString } from '@helpers/time';
import { store } from './store';

export const useTooltip = () => {
  const setToolTipToTime = useCallback(
    (time: number, [x, y]: [number, number]) => {
      const text = formatTimeToString(time);
      store.send({ type: 'setToolTip', x, y, text });
    },
    []
  );

  const setToolTip = useCallback((text: string, [x, y]: [number, number]) => {
    store.send({ type: 'setToolTip', x, y, text });
  }, []);

  const hideToolTip = useCallback(() => {
    store.send({ type: 'hideToolTip' });
  }, []);

  return { setToolTipToTime, setToolTip, hideToolTip };
};
