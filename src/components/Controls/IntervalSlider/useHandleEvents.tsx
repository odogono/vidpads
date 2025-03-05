import { useCallback, useRef, useState } from 'react';

// import { createLog } from '@helpers/log';

// const log = createLog('intervalSlider/handles');

interface UseEventsProps {
  onDrag: (deltaX: number, doSeek?: boolean) => void;
  onDragEnd: () => void;
  isDisabled?: boolean;
}

export const useHandleEvents = ({
  onDrag,
  onDragEnd,
  isDisabled = false
}: UseEventsProps) => {
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
    // e.currentTarget.setPointerCapture(e.touches[0].identifier);
    // log.debug('Touch start');
    setIsTouching(true);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      // e.currentTarget.releasePointerCapture(e.touches[0].identifier);
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

  if (isDisabled) {
    return {
      handlers: {}
    };
  }

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
