'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { Position, Rect, getOffsetPosition } from '@types';

const log = createLog('useMarquee');

interface UseMarqueeProps {
  onSelectUpdate?: (rect: Rect) => void;
  onSelectEnd?: (rect: Rect) => void;
}

export const useMarquee = ({
  onSelectUpdate,
  onSelectEnd
}: UseMarqueeProps) => {
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [endPosition, setEndPosition] = useState({ x: 0, y: 0 });
  const [isTouched, setIsTouched] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isTouched) return;
      e.preventDefault();

      // log.debug('handleTouchMove', e.pointerId);
      const { x, y } = getOffsetPosition(e);

      const dragThreshold = 10;

      const deltaX = x - startPosition.x;
      const deltaY = y - startPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (!isDragging && distance > dragThreshold) {
        setIsDragging(true);
        setEndPosition({ x, y });
        // log.debug('setIsDragging', true);
      }

      if (isDragging) {
        setEndPosition({ x, y });

        if (onSelectUpdate) {
          onSelectUpdate(positionsToRect(startPosition, { x, y }));
        }
      }
    },
    [isDragging, isTouched, onSelectUpdate, startPosition]
  );

  const handleTouchDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const pos = getOffsetPosition(e);

      // log.debug('handleTouchDown', pos);
      setStartPosition(pos);
      setEndPosition(pos);
      setIsTouched(true);
    },
    [setIsTouched]
  );

  const handleTouchUp = useCallback(
    (e: React.PointerEvent) => {
      // log.debug('handleTouchUp', startPosition, endPosition);
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsTouched(false);
      setIsDragging(false);

      if (onSelectEnd) {
        onSelectEnd(positionsToRect(startPosition, endPosition));
      }
    },
    [startPosition, endPosition, onSelectEnd]
  );

  return {
    marqueeStart: startPosition,
    marqueeEnd: endPosition,
    isDragging,
    // onTouchStart: handleTouchDown,
    onPointerDown: handleTouchDown,
    onPointerMove: handleTouchMove,
    onPointerUp: handleTouchUp
    // onTouchMove: handleTouchMove,
    // onTouchEnd: handleTouchUp
  };
};

const positionsToRect = (start: Position, end: Position) => {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  return { x, y, width, height };
};
