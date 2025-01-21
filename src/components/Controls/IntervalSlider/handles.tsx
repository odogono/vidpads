import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';

const log = createLog('intervalSlider/handles');

export interface HandleProps {
  x?: number;
  width?: number;
  height?: number;
  onDrag?: (deltaX: number) => void;
}

interface UseEventsProps {
  onDrag: (deltaX: number) => void;
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
    log.debug('Pointer down');
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      startXRef.current = 0;
      xRef.current = 0;
      setIsTouching(false);
      log.debug('Pointer up');
      onDragEnd?.();
    },
    [onDragEnd]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isTouching) return;

      const deltaX = e.clientX - startXRef.current;
      xRef.current = e.clientX;

      onDrag(deltaX);
      // log.debug('Pointer move', { deltaX });
    },
    [isTouching, startXRef, onDrag]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isTouching) return;
      const deltaX = e.touches[0].clientX - startXRef.current;
      xRef.current = e.touches[0].clientX;

      onDrag(deltaX);
    },
    [isTouching, startXRef, onDrag]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.touches[0].identifier);
    log.debug('Touch start');
    setIsTouching(true);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      e.currentTarget.releasePointerCapture(e.touches[0].identifier);
      log.debug('Touch end');
      setIsTouching(false);
      onDragEnd?.();
    },
    [onDragEnd]
  );

  const handleWheel = useCallback(() => {
    log.debug('Wheel');
  }, []);

  return {
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerMove: handlePointerMove,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchMove: handleTouchMove,
      onWheel: handleWheel
    }
  };
};

export const HandleLeft = ({
  x = 0,
  width = 0,
  height = 0,
  onDrag
}: HandleProps) => {
  const [delta, setDelta] = useState(0);

  const handleDrag = useCallback(
    (deltaX: number) => {
      setDelta(deltaX);
      onDrag?.(deltaX);
    },
    [onDrag]
  );
  const handleDragEnd = useCallback(() => {
    setDelta(0);
  }, []);

  useEffect(() => {
    setDelta(0);
  }, [x]);

  const { handlers } = useEvents({
    onDrag: handleDrag,
    onDragEnd: handleDragEnd
  });

  // Update ref when onDrag changes
  // useEffect(() => {
  //   onDragRef.current = onDrag;
  // }, [onDrag, onDragRef]);

  return (
    <div
      {...handlers}
      className='absolute pointer-events-auto cursor-ew-resize'
      style={{
        left: x - width + delta,
        backgroundColor: 'gold',
        width,
        height,
        border: '1px solid black',
        borderRadius: '5px 0 0 5px'
      }}
    ></div>
  );
};

export const HandleRight = ({
  x = 0,
  width = 0,
  height = 0,
  onDrag
}: HandleProps) => {
  const handleDrag = useCallback(
    (deltaX: number) => {
      onDrag?.(deltaX);
    },
    [onDrag]
  );

  const { handlers } = useEvents({ onDrag: handleDrag });

  return (
    <div
      {...handlers}
      className='absolute pointer-events-auto cursor-ew-resize'
      style={{
        left: x,
        backgroundColor: 'gold',
        width,
        height,
        borderRadius: '0 5px 5px 0'
      }}
    ></div>
  );
};
