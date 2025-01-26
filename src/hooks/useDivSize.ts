import { useCallback, useEffect, useState } from 'react';

export const useDivSize = (ref: React.RefObject<HTMLDivElement>) => {
  const [size, setSize] = useState({ width: 0, height: 0, x: 0, y: 0 });

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
