import { useEffect, useRef, useState } from 'react';

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
};

export interface PadComponentProps extends DragHandlers {
  pad: Pad;
  isDraggedOver: boolean;
  onTap: (padId: string, hasMedia: boolean) => void;
}

const log = createLog('PadComponent');

export const PadComponent = ({
  pad,
  isDraggedOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onPadDragStart
}: PadComponentProps) => {
  const { data: thumbnail } = useThumbnail(getPadSourceUrl(pad));
  const elementRef = useRef<HTMLDivElement>(null);

  const { createGhost, removeGhost, updateGhost } = useGhostDrag();

  const dragImage = useNullImage();

  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: TouchEvent | MouseEvent) => {
    log.debug('handleTouchStart', isDragging);

    // Only handle touch events, let native drag handle mouse events
    if (thumbnail && e.type.includes('touch')) {
      e.preventDefault(); // Prevent default only for touch events
      setIsDragging(true);
      createGhost(e, elementRef.current!);
    } else {
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: TouchEvent | MouseEvent) => {
    const isMouseEvent = e.type.includes('mouse');
    const clientX = isMouseEvent
      ? (e as MouseEvent).clientX
      : (e as TouchEvent).touches[0].clientX;
    const clientY = isMouseEvent
      ? (e as MouseEvent).clientY
      : (e as TouchEvent).touches[0].clientY;

    requestAnimationFrame(() => {
      updateGhost(clientX, clientY);
    });

    log.debug('handleTouchMove', clientX, clientY);
  };

  const handleTouchEnd = () => {
    removeGhost();
    setIsDragging(false);
    log.debug('handleTouchEnd', isDragging);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleTouchEnd);
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('mousemove', handleTouchMove);
      document.addEventListener('dragover', handleDragOver);
      // document.addEventListener('touchmove', handleTouchMove, {
      // passive: false
      // });
    }

    return () => {
      document.removeEventListener('mouseup', handleTouchEnd);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleTouchMove);
      document.removeEventListener('dragover', handleDragOver);
      // document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.clearData();
    e.dataTransfer.setData('application/pad-id', pad.id);
    e.dataTransfer.effectAllowed = 'move';

    // Use the empty canvas as the drag image
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    createGhost(e, elementRef.current!);

    setIsDragging(true);
    onPadDragStart(pad.id);
    log.debug('handleDragStart');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    log.debug('handleDrop', pad.id);
    onDrop(e, pad.id);
  };

  const handleDragOver = (e: DragEvent) => {
    const { clientX, clientY } = e;

    requestAnimationFrame(() => {
      updateGhost(clientX, clientY);
    });
  };

  // Add onDragEnd handler to clean up
  const handleDragEnd = () => {
    removeGhost();
    setIsDragging(false);
    log.debug('handleDragEnd', isDragging);
  };

  return (
    <>
      <div
        ref={elementRef}
        key={pad.id}
        className={`
          aspect-square rounded-lg cursor-pointer transition-all relative
          ${isDraggedOver ? 'bg-gray-600 scale-105' : 'bg-gray-800 hover:bg-gray-700'}
        `}
        // Only attach touch handlers for touch devices
        onTouchStart={thumbnail ? handleTouchStart : undefined}
        onTouchMove={thumbnail ? handleTouchMove : undefined}
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
    </>
  );
};
