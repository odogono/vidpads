import { useCallback, useEffect, useState } from 'react';

import { Rect } from '@types';

export const useElementRect = (ref: React.RefObject<HTMLElement | null>) => {
  const [size, setSize] = useState<Rect>({ width: 0, height: 0, x: 0, y: 0 });

  const handleResize = useCallback(() => {
    if (!ref.current) return;
    const { width, height, x, y } = ref.current.getBoundingClientRect();
    setSize({ width, height, x, y });
  }, [ref]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize, ref]);

  return size;
};
