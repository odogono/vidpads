'use client';

import { useCallback, useRef, useState } from 'react';

import { useKeyboard } from '@helpers/keyboard';
// import { createLog } from '@helpers/log';
import { roundNumberToDecimalPlaces as roundDP } from '@helpers/number';

// const log = createLog('dial/useTouch');

export interface UseTouchProps {
  value: number;
  onTouch: (x: number, isTouching: boolean) => void;
  onTouchEnd?: (x: number) => void;
}

type Pos = [number, number];
type TouchElement = HTMLDivElement;

export const useTouch = ({ value, onTouch, onTouchEnd }: UseTouchProps) => {
  const { isShiftKeyDown } = useKeyboard();
  const [isTouching, setIsTouching] = useState(false);

  const startPositionRef = useRef<Pos>([0, 0]);

  const callTouch = useCallback(
    ([x, y]: Pos) => {
      const [startX, startY] = startPositionRef.current;
      const deltaX = x - startX;
      const deltaY = y - startY;
      startPositionRef.current = [x, y];

      const newValue = value + deltaY / 100 + deltaX / 1000;
      const normalizedValue = Math.max(0, Math.min(1, newValue));

      onTouch(normalizedValue, true);
    },
    [onTouch, value]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<TouchElement>) => {
      e.preventDefault(); // Prevent scrolling
      const touch = e.touches[0];
      startPositionRef.current = [touch.clientX, touch.clientY];

      setIsTouching(true);
    },
    [setIsTouching]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<TouchElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      startPositionRef.current = [e.clientX, e.clientY];
      setIsTouching(true);
    },
    [setIsTouching]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<TouchElement>) => {
      e.preventDefault();
      if (!isTouching) return;
      callTouch([e.clientX, e.clientY]);
    },
    [callTouch, isTouching]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<TouchElement>) => {
      e.preventDefault();
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsTouching(false);
      onTouchEnd?.(value);
    },
    [setIsTouching, value, onTouchEnd]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<TouchElement>) => {
      e.preventDefault();
      if (!isTouching) return;
      const touch = e.touches[0];
      callTouch([touch.clientX, touch.clientY]);
    },
    [callTouch, isTouching]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<TouchElement>) => {
      e.preventDefault();
      const { deltaY } = e;
      if (deltaY === 0) return;
      const amount = isShiftKeyDown() ? 0.1 : 0.01;
      const delta = e.deltaY < 0 ? amount : -amount;

      const newX = roundDP(Math.max(0, Math.min(1, value + delta)));
      // log.debug('[handleWheel]', { value, newX });

      onTouch(newX, true);
    },
    [onTouch, isShiftKeyDown, value]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<TouchElement>) => {
      e.preventDefault();
      setIsTouching(false);
      onTouchEnd?.(value);
    },
    [setIsTouching, value, onTouchEnd]
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
