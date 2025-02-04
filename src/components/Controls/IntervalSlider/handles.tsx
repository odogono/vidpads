import { useCallback, useEffect, useRef, useState } from 'react';

// import { createLog } from '@helpers/log';

// const log = createLog('intervalSlider/handles');

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

interface UseEventsProps {
  onDrag: (deltaX: number, doSeek?: boolean) => void;
  onDragEnd: () => void;
}

const useEvents = ({ onDrag, onDragEnd }: UseEventsProps) => {
  const [isTouching, setIsTouching] = useState(false);
  const startXRef = useRef<number>(0);
  const xRef = useRef<number>(0);

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

  // const handleWheel = useCallback(
  //   (e: React.WheelEvent) => {
  //     e.preventDefault();

  //     const amount = isShiftKeyDown() ? 0.1 : 0.01;
  //     const delta = e.deltaY < 0 ? amount : -amount;
  //     // const { scrollLeft, scrollTop } = e.target as HTMLElement;
  //     // log.debug('Wheel', e);
  //     onDrag(delta, false);
  //     onDragEnd?.();
  //   },
  //   [isShiftKeyDown, onDrag, onDragEnd]
  // );

  return {
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerMove: handlePointerMove,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchMove: handleTouchMove
      // TODO not working very well once moved close to bounds
      // onWheel: handleWheel
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

  const { handlers } = useEvents({
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
        backgroundColor: '#DAA520',
        width,
        height,
        borderRadius
      }}
    >
      <div className='border-l-1 border-r-1 border-black w-1 h-6' />
    </div>
  );
};
