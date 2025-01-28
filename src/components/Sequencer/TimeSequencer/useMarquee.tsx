'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { isPointInRect } from '@helpers/number';
import { Position, Rect, getOffsetPosition } from '@types';

const log = createLog('useMarquee');

interface UseMarqueeProps {
  onSelectUpdate?: (rect: Rect, isFinished?: boolean | undefined) => void;
  onMoveUpdate?: (pos: Position, isFinished?: boolean | undefined) => void;
  hasSelectedEvents: boolean;
  selectedEventsRect?: Rect;
}

export const useMarquee = ({
  onSelectUpdate,
  onMoveUpdate,
  hasSelectedEvents,
  selectedEventsRect
}: UseMarqueeProps) => {
  const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
  const [marqueeEnd, setMarqueeEnd] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [endPosition, setEndPosition] = useState({ x: 0, y: 0 });
  const [isTouched, setIsTouched] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const handleTouchMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isTouched) return;
      e.preventDefault();

      // log.debug('handleTouchMove', e.pointerId);
      const { x, y } = getOffsetPosition(e);

      if (isMoving) {
        if (onMoveUpdate) {
          const pos = {
            x: x - endPosition.x,
            y: y - endPosition.y
          };
          if (pos.x !== 0 || pos.y !== 0) {
            onMoveUpdate(pos, false);
          }
          setEndPosition({ x, y });
        }
      } else {
        const dragThreshold = 10;

        const deltaX = x - startPosition.x;
        const deltaY = y - startPosition.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (!isDragging && distance > dragThreshold) {
          setIsDragging(true);
          setMarqueeEnd({ x, y });
          // log.debug('setIsDragging', true);
        }

        if (isDragging) {
          setMarqueeEnd({ x, y });

          if (onSelectUpdate) {
            onSelectUpdate(positionsToRect(marqueeStart, { x, y }), false);
          }
        }
      }
    },
    [
      isTouched,
      isMoving,
      onMoveUpdate,
      endPosition.x,
      endPosition.y,
      startPosition.x,
      startPosition.y,
      isDragging,
      onSelectUpdate,
      marqueeStart
    ]
  );

  const handleTouchDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const pos = getOffsetPosition(e);

      let beginMoving = false;

      if (hasSelectedEvents && selectedEventsRect) {
        // check whether this pos is within the existing bounds
        const rect = positionsToRect(startPosition, endPosition);
        const isIntersecting = isPointInRect(pos, selectedEventsRect);

        log.debug(
          'handleTouchDown',
          { isIntersecting },
          pos,
          selectedEventsRect
        );
        if (isIntersecting) {
          beginMoving = true;
        }
      }

      // log.debug('handleTouchDown', pos, hasSelectedEvents);

      setIsTouched(true);
      setStartPosition(pos);
      setEndPosition(pos);

      if (!beginMoving) {
        setMarqueeStart(pos);
        setMarqueeEnd(pos);
      }
      setIsMoving(beginMoving);
    },
    [endPosition, hasSelectedEvents, startPosition, selectedEventsRect]
  );

  const handleTouchUp = useCallback(
    (e: React.PointerEvent) => {
      // log.debug('handleTouchUp', startPosition, endPosition);
      e.currentTarget.releasePointerCapture(e.pointerId);

      if (isMoving) {
        if (onMoveUpdate) {
          const pos = {
            x: endPosition.x - startPosition.x,
            y: endPosition.y - startPosition.y
          };
          onMoveUpdate(pos, true);
        }
      } else {
        if (onSelectUpdate) {
          onSelectUpdate(positionsToRect(marqueeStart, marqueeEnd), true);
        }
      }

      setIsTouched(false);
      setIsDragging(false);
    },
    [
      isMoving,
      onMoveUpdate,
      endPosition,
      startPosition,
      onSelectUpdate,
      marqueeStart,
      marqueeEnd
    ]
  );

  return {
    marqueeStart,
    marqueeEnd,
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
