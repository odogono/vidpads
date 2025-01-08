import { useCallback, useEffect, useRef } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { useThumbnail } from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import type { Pad } from '@model/types';
import { useGhostDrag } from './ghost';
import { GeneralTouchEvent } from './types';
import { useNullImage } from './useNullImage';

export interface PadComponentProps {
  pad: Pad;
  onEmptyPadTouch: (padId: string) => void;
}

// const isTouchEvent = (e: GeneralTouchEvent) => e.type.includes('touch');
const isMouseEvent = (e: GeneralTouchEvent) => e.type.includes('mouse');

const log = createLog('PadComponent');

export const PadComponent = ({ pad, onEmptyPadTouch }: PadComponentProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { data: thumbnail } = useThumbnail(getPadSourceUrl(pad));
  const dragImage = useNullImage();
  const { createGhost, removeGhost, updateGhost } = useGhostDrag();
  const {
    isDragging,
    setDraggingPadId,
    dragOverId,
    onDragStart,
    onDragLeave,
    onDragOver,
    onDragEnd,
    onDrop
  } = usePadDnD();
  const isDraggingOver = dragOverId === pad.id;
  const events = useEvents();

  useEffect(() => {
    if (!isDragging) {
      removeGhost();
    }
  }, [isDragging, removeGhost]);

  const handleTouchStart = useCallback(
    (e: GeneralTouchEvent) => {
      // log.debug('handleTouchStart');
      events.emit('pad:touchdown', { padId: pad.id });
    },
    [events, pad]
  );

  const handleTouchMove = useCallback(
    (e: GeneralTouchEvent) => {
      const clientX = isMouseEvent(e)
        ? (e as React.MouseEvent<HTMLDivElement>).clientX
        : (e as React.TouchEvent<HTMLDivElement>).touches[0].clientX;
      const clientY = isMouseEvent(e)
        ? (e as React.MouseEvent<HTMLDivElement>).clientY
        : (e as React.TouchEvent<HTMLDivElement>).touches[0].clientY;

      requestAnimationFrame(() => {
        updateGhost(clientX, clientY);
      });
    },
    [updateGhost]
  );

  const handleTouchEnd = useCallback(() => {
    log.debug('handleTouchEnd');

    // Only trigger tap if we didn't drag
    if (!isDragging) {
      if (!thumbnail) {
        onEmptyPadTouch(pad.id);
      } else {
        events.emit('pad:touchup', { padId: pad.id });
      }
    } else {
      removeGhost();
      setDraggingPadId(null);
    }
  }, [
    isDragging,
    thumbnail,
    onEmptyPadTouch,
    pad.id,
    events,
    removeGhost,
    setDraggingPadId
  ]);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.clearData();
      e.dataTransfer.setData('application/pad-id', pad.id);
      e.dataTransfer.effectAllowed = 'move';

      // Use the empty canvas as the drag image
      e.dataTransfer.setDragImage(dragImage, 0, 0);

      createGhost(e, elementRef.current!);

      onDragStart(pad.id);
      log.debug('handleDragStart');
    },
    [pad.id, dragImage, createGhost, onDragStart]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      onDrop(e, pad.id);
    },
    [pad.id, onDrop]
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      const { clientX, clientY } = e;

      requestAnimationFrame(() => {
        updateGhost(clientX, clientY);
      });
    },
    [updateGhost]
  );

  // Add onDragEnd handler to clean up
  const handleDragEnd = useCallback(() => {
    log.debug('handleDragEnd', isDragging);
    // Ensure we clean up even if the component is about to unmount
    requestAnimationFrame(() => {
      removeGhost();
      onDragEnd(pad.id);
    });
  }, [isDragging, removeGhost, onDragEnd, pad.id]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleTouchEnd);
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('mousemove', handleTouchMove);
      document.addEventListener('dragover', handleDragOver);
      document.addEventListener('touchmove', handleTouchMove, {
        passive: false
      });
    }

    return () => {
      document.removeEventListener('mouseup', handleTouchEnd);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleTouchMove);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, handleTouchEnd, handleTouchMove, handleDragOver]);

  const dragProps = {
    // Native drag and drop handlers
    draggable: !!thumbnail,
    onDragStart: thumbnail ? handleDragStart : undefined,
    onDragEnd: thumbnail ? handleDragEnd : undefined,
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => onDragOver(e, pad.id),
    onDragLeave: () => onDragLeave(pad.id),
    onDrop: handleDrop
  };

  return (
    <div
      ref={elementRef}
      key={pad.id}
      className={`
          aspect-square rounded-lg cursor-pointer transition-all relative
          ${isDraggingOver ? 'bg-gray-600 scale-105' : 'bg-gray-800 hover:bg-gray-700'}
        `}
      // onClick={handleClick}
      // Only attach touch handlers for touch devices
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      {...dragProps}
    >
      {thumbnail && (
        <img
          src={thumbnail}
          alt={`Thumbnail for pad ${pad.id}`}
          className='w-full h-full object-cover rounded-lg'
        />
      )}
      <span className='absolute bottom-2 right-2 text-xs text-gray-400 select-none'>
        {pad.id}
      </span>
    </div>
  );
};
