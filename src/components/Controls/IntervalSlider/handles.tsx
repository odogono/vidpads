import { useCallback, useEffect, useRef, useState } from 'react';

import { debounce } from '@helpers/debounce';
import { createLog } from '@helpers/log';

const log = createLog('intervalSlider/handles');

export interface HandleProps {
  x?: number;
  width?: number;
  height?: number;
  maxX?: number;
  onDrag?: (deltaX: number) => void;
  onSeek?: (newStart: number, inProgress: boolean) => void;
  direction: 'left' | 'right';
}

interface UseEventsProps {
  onDrag: (deltaX: number, doSeek?: boolean) => void;
  onDragEnd: () => void;
}

const useEvents = ({ onDrag, onDragEnd }: UseEventsProps) => {
  const [isTouching, setIsTouching] = useState(false);
  // const [startX, setStartX] = useState<number | null>(null);
  const startXRef = useRef<number>(0);
  const xRef = useRef<number>(0);
  // const onDragRef = useRef<((deltaX: number) => void) | undefined>(undefined);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    xRef.current = e.clientX;
    setIsTouching(true);
    // log.debug('Pointer down', { clientX: e.clientX });
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      startXRef.current = 0;
      xRef.current = 0;
      setIsTouching(false);
      // log.debug('Pointer up');
      onDragEnd?.();
    },
    [onDragEnd]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isTouching) return;

      const deltaX = e.clientX - xRef.current;
      xRef.current = e.clientX;

      onDrag(deltaX);
      // log.debug('Pointer move', { deltaX });
    },
    [isTouching, onDrag]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isTouching) return;
      const deltaX = e.touches[0].clientX - xRef.current;
      xRef.current = e.touches[0].clientX;

      onDrag(deltaX);
    },
    [isTouching, xRef, onDrag]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.touches[0].identifier);
    // log.debug('Touch start');
    setIsTouching(true);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      e.currentTarget.releasePointerCapture(e.touches[0].identifier);
      // log.debug('Touch end');
      setIsTouching(false);
      onDragEnd?.();
    },
    [onDragEnd]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.01 : -0.01;
      // log.debug('Wheel', { delta });
      onDrag(delta, false);
      onDragEnd?.();
    },
    [onDrag, onDragEnd]
  );

  return {
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerMove: handlePointerMove,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchMove: handleTouchMove,
      onWheel: debounce(handleWheel, 10)
    }
  };
};

export const Handle = ({
  x = 0,
  width = 0,
  height = 0,
  onDrag,
  onSeek,
  direction,
  maxX = 0
}: HandleProps) => {
  // const [delta, setDelta] = useState(0);
  const [localX, setLocalX] = useState(x);

  const handleDrag = useCallback(
    (deltaX: number, doSeek: boolean = true) => {
      setLocalX(localX + deltaX);
      // log.debug('[handleDrag]', { localX, newLocalX: localX + deltaX });
      if (doSeek) onSeek?.(localX + deltaX, true);
    },
    [onSeek, localX]
  );
  const handleDragEnd = useCallback(() => {
    onDrag?.(localX);
    // setDelta(0);
    // setDelta(0);
  }, [localX, onDrag]);

  useEffect(() => {
    setLocalX(x);
  }, [x]);

  const { handlers } = useEvents({
    onDrag: handleDrag,
    onDragEnd: handleDragEnd
  });

  const left =
    direction === 'left'
      ? Math.max(0, localX - width)
      : Math.min(maxX + width, localX);
  const borderRadius = direction === 'left' ? '5px 0 0 5px' : '0 5px 5px 0';

  // if (direction === 'right')
  //   log.debug('[handle]', { x, delta, xd: x + delta, maxX });
  return (
    <div
      {...handlers}
      className='absolute pointer-events-auto cursor-ew-resize'
      style={{
        left,
        backgroundColor: 'gold',
        width,
        height,
        // border: '1px solid black',
        borderRadius
      }}
    ></div>
  );
};
