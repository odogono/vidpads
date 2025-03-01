import { useCallback, useEffect, useRef, useState } from 'react';

import { useHandleEvents } from './useHandleEvents';

export interface HandleProps {
  x?: number;
  width?: number;
  height?: number;
  minX?: number;
  maxX?: number;
  onDrag?: (deltaX: number) => void;
  onSeek?: (newStart: number, inProgress: boolean) => void;
  direction: 'left' | 'right';
}

export const Handle = ({
  x = 0,
  width = 0,
  height = 0,
  onDrag,
  onSeek,
  direction,
  minX = 0,
  maxX = 0
}: HandleProps) => {
  const [localX, setLocalX] = useState(x);

  const handleDrag = useCallback(
    (deltaX: number, doSeek: boolean = true) => {
      const newLocalX = Math.min(maxX, Math.max(minX, localX + deltaX));
      setLocalX(newLocalX);
      // log.debug('[handleDrag]', { localX, newLocalX: localX + deltaX });
      if (doSeek) onSeek?.(newLocalX, true);
    },
    [onSeek, localX, maxX, minX]
  );
  const handleDragEnd = useCallback(() => {
    onDrag?.(localX);
  }, [localX, onDrag]);

  useEffect(() => {
    setLocalX(x);
  }, [x]);

  const { handlers } = useHandleEvents({
    onDrag: handleDrag,
    onDragEnd: handleDragEnd
  });

  const left =
    direction === 'left'
      ? Math.min(maxX, Math.max(minX - width, localX - width))
      : Math.min(maxX + width, localX);
  const borderRadius = direction === 'left' ? '5px 0 0 5px' : '0 5px 5px 0';

  return (
    <div
      {...handlers}
      className='absolute pointer-events-auto cursor-ew-resize flex items-center justify-center'
      style={{
        left,
        backgroundColor: 'var(--c7)',
        width,
        height,
        borderRadius
      }}
    >
      <div className='border-l-1 border-r-1 border-black w-1 h-6' />
    </div>
  );
};
