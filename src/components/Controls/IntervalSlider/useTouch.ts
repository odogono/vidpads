'use client';

import { useCallback, useRef, useState } from 'react';

import { debounce } from '@helpers/debounce';
import { useKeyboard } from '@helpers/keyboard';
import { createLog } from '@helpers/log';

const log = createLog('intervalSlider/useTouch');

export interface UseTouchProps {
  dimensions: DOMRect;
  onTouch: (x: number, isTouching: boolean) => void;
  onTouchEnd: (x: number) => void;
}

export const useTouch = ({
  dimensions,
  onTouch,
  onTouchEnd
}: UseTouchProps) => {
  const { isShiftKeyDown } = useKeyboard();
  const [isTouching, setIsTouching] = useState(false);
  const xRef = useRef<number>(0);

  const debouncedOnTouch = onTouch; //useCallback(debounce(onTouch, 1), [onTouch]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault(); // Prevent scrolling
      const touch = e.touches[0];

      if (!dimensions) return;

      setIsTouching(true);

      const x = touch.clientX - dimensions.left;
      debouncedOnTouch(x, true);
      xRef.current = x;
      // const y = touch.clientY - rect.top;

      // Log or handle the touch coordinates
      // log.debug('Touch position:', x);
    },
    [dimensions, debouncedOnTouch, setIsTouching]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const x = e.clientX - dimensions.left;
      xRef.current = x;
      debouncedOnTouch(x, true);
      // log.debug('Pointer down:', e.clientX, x, dimensions.left);
      setIsTouching(true);
    },
    [dimensions, debouncedOnTouch, setIsTouching]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!isTouching) return;
      const x = e.clientX - dimensions.left;
      if (xRef.current !== x) {
        debouncedOnTouch(x, true);
        xRef.current = x;
      }
      // log.debug('Pointer move:', e.clientX - dimensions.left);
    },
    [dimensions, debouncedOnTouch, isTouching]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.currentTarget.releasePointerCapture(e.pointerId);
      // log.debug('Pointer up:', e.clientX - dimensions.left);
      setIsTouching(false);
      debouncedOnTouch(xRef.current, false);
      onTouchEnd?.(xRef.current);
    },
    [debouncedOnTouch, setIsTouching, onTouchEnd]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!isTouching) return;
      const touch = e.touches[0];

      if (!dimensions) return;

      const x = touch.clientX - dimensions.left;
      if (xRef.current !== x) {
        debouncedOnTouch(x, true);
        xRef.current = x;
      }
      // Log or handle the touch coordinates
      // log.debug('Touch move:', x);
    },
    [dimensions, debouncedOnTouch, isTouching]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const amount = isShiftKeyDown() ? 0.1 : 0.01;
      const delta = e.deltaY < 0 ? amount : -amount;
      xRef.current += delta;
      debouncedOnTouch(xRef.current, true);
    },
    [debouncedOnTouch, xRef, isShiftKeyDown]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      setIsTouching(false);
      debouncedOnTouch(xRef.current, false);
      onTouchEnd?.(xRef.current);
    },
    [debouncedOnTouch, setIsTouching, onTouchEnd]
  );

  return {
    onTouchStart: handleTouchStart,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onWheel: handleWheel
  };
};
