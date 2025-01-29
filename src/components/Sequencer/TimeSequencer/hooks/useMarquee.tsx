'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { isPointInRect } from '@helpers/number';
import { Position, Rect, getOffsetPosition } from '@types';

const log = createLog('useMarquee');

interface UseMarqueeProps {
  onSelectUpdate?: (rect: Rect, isFinished?: boolean | undefined) => void;
  onMoveUpdate?: (
    pos: Position,
    start: Position,
    isFinished?: boolean | undefined
  ) => void;
  hasSelectedEvents: boolean;
  selectedEventsRect?: Rect;
  onLongPressDown?: (rect: Rect, isFinished?: boolean | undefined) => void;
}

export const useMarquee = ({
  onSelectUpdate,
  onMoveUpdate,
  hasSelectedEvents,
  selectedEventsRect,
  onLongPressDown
}: UseMarqueeProps) => {
  const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
  const [marqueeEnd, setMarqueeEnd] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [endPosition, setEndPosition] = useState({ x: 0, y: 0 });
  const [isTouched, setIsTouched] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isLongTouch, setIsLongTouch] = useState(false);
  const longTouchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (longTouchTimeoutRef.current) {
        clearTimeout(longTouchTimeoutRef.current);
      }
    };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.PointerEvent) => {
      // Clear long touch timeout on move
      if (longTouchTimeoutRef.current) {
        clearTimeout(longTouchTimeoutRef.current);
        setIsLongTouch(false);
      }

      // Don't handle move if interacting with playhead
      if ((e.target as HTMLElement).closest('.vo-seq-playhead')) {
        return;
      }

      if (!isTouched) return;
      e.preventDefault();

      // log.debug('handleTouchMove', e.pointerId);
      const { x, y } = getOffsetPosition(e);

      if (isMoving) {
        if (onMoveUpdate) {
          const pos = {
            x: x - endPosition.x,
            y: y - startPosition.y
          };
          if (pos.x !== 0 || pos.y !== 0) {
            onMoveUpdate(pos, startPosition, false);
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
      startPosition,
      isDragging,
      onSelectUpdate,
      marqueeStart
    ]
  );

  const handleTouchDown = useCallback(
    (e: React.PointerEvent) => {
      // Don't start marquee if clicking on playhead elements
      if ((e.target as HTMLElement).closest('.vo-seq-header')) {
        return;
      }

      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const pos = getOffsetPosition(e);

      let beginMoving = false;

      if (hasSelectedEvents && selectedEventsRect) {
        // check whether this pos is within the existing bounds
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

      longTouchTimeoutRef.current = setTimeout(() => {
        setIsLongTouch(true);
        onLongPressDown?.(positionsToRect(pos, pos), false);
        setIsMoving(true);
      }, 250); // 250ms for long touch
    },
    [hasSelectedEvents, selectedEventsRect, onLongPressDown]
  );

  const handleTouchUp = useCallback(
    (e: React.PointerEvent) => {
      // Clear the long touch timeout
      if (longTouchTimeoutRef.current) {
        clearTimeout(longTouchTimeoutRef.current);
      }

      // Reset long touch state
      setIsLongTouch(false);

      // log.debug('handleTouchUp', startPosition, endPosition);
      e.currentTarget.releasePointerCapture(e.pointerId);

      if (isMoving) {
        if (onMoveUpdate) {
          const pos = {
            x: endPosition.x - startPosition.x,
            y: endPosition.y - startPosition.y
          };
          onMoveUpdate(pos, startPosition, true);
        }
      } else {
        if (!isLongTouch) {
          onSelectUpdate?.(positionsToRect(marqueeStart, marqueeEnd), true);
        } else {
          onLongPressDown?.(positionsToRect(marqueeStart, marqueeEnd), true);
        }
      }

      setIsTouched(false);
      setIsDragging(false);
    },
    [
      isMoving,
      onMoveUpdate,
      endPosition.x,
      endPosition.y,
      startPosition,
      isLongTouch,
      onSelectUpdate,
      marqueeStart,
      marqueeEnd,
      onLongPressDown
    ]
  );

  return {
    marqueeStart,
    marqueeEnd,
    isDragging,
    isLongTouch,
    onPointerDown: handleTouchDown,
    onPointerMove: handleTouchMove,
    onPointerUp: handleTouchUp,
    onPointerCancel: handleTouchUp
  };
};

const positionsToRect = (start: Position, end: Position) => {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  return { x, y, width, height };
};
