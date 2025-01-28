import { useCallback, useEffect, useState } from 'react';

import { useKeyboard } from '@helpers/keyboard/useKeyboard';
import { createLog } from '@helpers/log';
import { GeneralDragEvent, GeneralTouchEvent, getClientPosition } from '@types';

interface UseDnDProps {
  id: string;
  onTouchDown?: (e: GeneralTouchEvent) => void;
  onTouchUp?: (e: GeneralTouchEvent) => void;
  onDragStart?: (e: GeneralDragEvent) => void;
  onDragEnd?: (e: GeneralDragEvent) => void;
  dragThreshold?: number;
}

const log = createLog('sequencer/useDnD');

export const useDnD = ({
  id,
  onTouchDown,
  onTouchUp,
  onDragStart,
  onDragEnd,
  dragThreshold = 10
}: UseDnDProps) => {
  const [isDraggable, setIsDraggable] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [isTouched, setIsTouched] = useState(false);
  const { isAltKeyDown } = useKeyboard();

  const handleDragStart = useCallback(
    (e: GeneralDragEvent) => {
      log.debug('handleDragStart');
      e.dataTransfer?.setData('text/plain', 'This text may be dragged');
      e.dataTransfer!.dropEffect = isAltKeyDown() ? 'copy' : 'move';
      onDragStart?.(e);
    },
    [onDragStart, isAltKeyDown]
  );

  const handleDragEnd = useCallback(
    (e: GeneralDragEvent) => {
      onDragEnd?.(e);
    },
    [onDragEnd]
  );

  const handleTouchMove = useCallback(
    (e: GeneralTouchEvent) => {
      if (!isTouched) return;
      const { x, y } = getClientPosition(e);

      const deltaX = x - startPosition.x;
      const deltaY = y - startPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (!isDraggable && distance > dragThreshold) {
        setIsDraggable(true);

        // const event = new DragEvent('dragstart', {
        //   bubbles: true,
        //   cancelable: true,
        //   dataTransfer: new DataTransfer(),
        //   view: window
        // });
        // e.target?.dispatchEvent(event);
        log.debug('handleTouchMove', { distance, dragThreshold }, e.target);
        // handleDragStart(e as GeneralDragEvent);
      }

      // setStartPosition({ x, y });
    },
    [isTouched, startPosition.x, startPosition.y, isDraggable, dragThreshold]
  );

  const handleTouchDown = useCallback(
    (e: GeneralTouchEvent) => {
      log.debug('handleTouchDown');
      setStartPosition(getClientPosition(e));
      setIsTouched(true);
      // setIsDraggable(false);
      onTouchDown?.(e);
    },
    [onTouchDown, setIsTouched, setIsDraggable]
  );

  const handleTouchUp = useCallback(
    (e: GeneralTouchEvent) => {
      log.debug('handleTouchUp', isDraggable);
      if (isDraggable) {
        handleDragEnd(e as GeneralDragEvent);
      }
      setIsTouched(false);
      setIsDraggable(false);
      onTouchUp?.(e);
    },
    [isDraggable, onTouchUp, handleDragEnd]
  );

  // useEffect(() => {
  //   if (isTouched) {
  //     window.addEventListener('mousemove', handleTouchMove);
  //     window.addEventListener('touchmove', handleTouchMove);
  //     window.addEventListener('mouseup', handleTouchUp);
  //     window.addEventListener('touchend', handleTouchUp);
  //   } else {
  //     window.removeEventListener('mousemove', handleTouchMove);
  //     window.removeEventListener('touchmove', handleTouchMove);
  //     window.removeEventListener('mouseup', handleTouchUp);
  //     window.removeEventListener('touchend', handleTouchUp);
  //   }

  //   return () => {
  //     window.removeEventListener('mousemove', handleTouchMove);
  //     window.removeEventListener('touchmove', handleTouchMove);
  //     window.removeEventListener('mouseup', handleTouchUp);
  //     window.removeEventListener('touchend', handleTouchUp);
  //   };
  // }, [isTouched, handleTouchMove, handleTouchUp]);

  // useEffect(() => {
  //   if (isDraggable) {
  //     window.addEventListener('dragstart', handleDragStart);
  //     window.addEventListener('dragend', handleDragEnd);
  //   } else {
  //     window.removeEventListener('dragstart', handleDragStart);
  //     window.removeEventListener('dragend', handleDragEnd);
  //   }
  //   return () => {
  //     window.removeEventListener('dragstart', handleDragStart);
  //     window.removeEventListener('dragend', handleDragEnd);
  //   };
  // }, [isDraggable, handleDragStart, handleDragEnd]);

  return {
    draggable: true,
    // handleDragStart,
    // handleDragEnd,
    onMouseDown: handleTouchDown,
    onTouchStart: handleTouchDown,
    onMouseUp: handleTouchUp,
    onTouchEnd: handleTouchUp
    // handleTouchUp
  };
};
