import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useThumbnail } from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import type { Pad } from '@model/types';
import { useGhostDrag } from './ghost';
import { useNullImage } from './useNullImage';

// Create proper event types
type DragHandlers = {
  onDragOver: (e: React.DragEvent<HTMLDivElement>, padId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, padId: string) => void;
  onPadDragStart: (padId: string) => void;
  onPadDragEnd: () => void;
};

export interface PadComponentProps extends DragHandlers {
  pad: Pad;
  isDraggedOver: boolean;
  onTap: (padId: string, hasMedia: boolean) => void;
}

const log = createLog('PadComponent');

type GeneralTouchEvent =
  | React.TouchEvent<HTMLDivElement>
  | React.MouseEvent<HTMLDivElement>
  | MouseEvent
  | TouchEvent;

export const PadComponent = ({
  pad,
  isDraggedOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onPadDragStart,
  onPadDragEnd,
  onTap
}: PadComponentProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { data: thumbnail } = useThumbnail(getPadSourceUrl(pad));
  const dragImage = useNullImage();
  const { createGhost, removeGhost, updateGhost } = useGhostDrag();
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = useCallback(
    (e: GeneralTouchEvent) => {
      log.debug('handleTouchStart');

      // Only handle touch events, let native drag handle mouse events
      if (thumbnail && e.type.includes('touch')) {
        e.preventDefault(); // Prevent default only for touch events
        setIsDragging(true);
        createGhost(e, elementRef.current!);
      } else {
        e.preventDefault();
      }
    },
    [thumbnail, elementRef, createGhost]
  );

  const handleTouchMove = useCallback(
    (e: GeneralTouchEvent) => {
      const isMouseEvent = e.type.includes('mouse');
      const clientX = isMouseEvent
        ? (e as React.MouseEvent<HTMLDivElement>).clientX
        : (e as React.TouchEvent<HTMLDivElement>).touches[0].clientX;
      const clientY = isMouseEvent
        ? (e as React.MouseEvent<HTMLDivElement>).clientY
        : (e as React.TouchEvent<HTMLDivElement>).touches[0].clientY;

      requestAnimationFrame(() => {
        updateGhost(clientX, clientY);
      });

      log.debug('handleTouchMove', clientX, clientY);
    },
    [updateGhost]
  );

  const handleTouchEnd = useCallback(
    (e: GeneralTouchEvent) => {
      removeGhost();
      setIsDragging(false);

      // Only trigger tap if we didn't drag
      if (!isDragging) {
        onTap(pad.id, !!thumbnail);
      }
    },
    [isDragging, onTap, pad.id, thumbnail, removeGhost]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.clearData();
      e.dataTransfer.setData('application/pad-id', pad.id);
      e.dataTransfer.effectAllowed = 'move';

      // Use the empty canvas as the drag image
      e.dataTransfer.setDragImage(dragImage, 0, 0);

      createGhost(e, elementRef.current!);

      setIsDragging(true);
      onPadDragStart(pad.id);
      log.debug('handleDragStart');
    },
    [pad.id, onPadDragStart, createGhost, elementRef, dragImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      log.debug('handleDrop', pad.id);
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
    removeGhost();
    setIsDragging(false);
    log.debug('handleDragEnd', isDragging);
    onPadDragEnd();
  }, [removeGhost, setIsDragging, isDragging, onPadDragEnd]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();

      // Prevent click when ending drag
      if (isDragging) return;

      onTap(pad.id, !!thumbnail);
    },
    [isDragging, onTap, pad.id, thumbnail]
  );

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

  return (
    <div
      ref={elementRef}
      key={pad.id}
      className={`
          aspect-square rounded-lg cursor-pointer transition-all relative
          ${isDraggedOver ? 'bg-gray-600 scale-105' : 'bg-gray-800 hover:bg-gray-700'}
        `}
      onClick={handleClick}
      // Only attach touch handlers for touch devices
      onTouchStart={thumbnail ? handleTouchStart : undefined}
      onTouchMove={thumbnail ? handleTouchMove : undefined}
      onTouchEnd={thumbnail ? (e) => e.preventDefault() : undefined}
      // Native drag and drop handlers
      draggable={!!thumbnail}
      onDragStart={thumbnail ? handleDragStart : undefined}
      onDragEnd={thumbnail ? handleDragEnd : undefined}
      onDragOver={(e) => onDragOver(e, pad.id)}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
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
