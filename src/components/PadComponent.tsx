import { useEffect, useMemo, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import type { Pad } from '@model/types';
import { useThumbnail } from '../model/db/api';
import { getPadSourceUrl } from '../model/pad';

export interface PadComponentProps {
  pad: Pad;
  isDraggedOver: boolean;
  onTap: (padId: string, hasMedia: boolean) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, padId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, padId: string) => void;
  onPadDragStart: (padId: string) => void;
}

const log = createLog('PadComponent');

type Position = { x: number; y: number };

// this variable indicates whether this browser is safari
const isSafari =
  /Safari/.test(navigator.userAgent) &&
  navigator.userAgent.indexOf('Chrome') < 0;

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
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const dragImage = useMemo(() => {
    const img = new Image();
    img.src =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    img.width = 0;
    img.height = 0;
    img.style.opacity = '0';
    return img;
  }, []);

  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: TouchEvent | MouseEvent) => {
    // Only handle touch events, let native drag handle mouse events
    if (thumbnail && e.type.includes('touch')) {
      e.preventDefault(); // Prevent default only for touch events
      setIsDragging(true);
      const dragGhost = createDragGhost(e, elementRef.current!);
      ghostRef.current = dragGhost;
      log.debug('handleTouchStart', isDragging);
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
      updateGhostPosition(clientX, clientY);
    });

    log.debug('handleTouchMove', clientX, clientY);
  };

  const handleTouchEnd = (e: TouchEvent | MouseEvent) => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
    setIsDragging(false);
    log.debug('handleTouchEnd', isDragging);
    // onDrop(e, pad.id);
  };

  const updateGhostPosition = (x: number, y: number) => {
    if (!ghostRef.current) return;
    const ghost = ghostRef.current;

    // Get the stored offsets
    const offsetX = parseFloat(ghost.dataset.offsetX || '0');
    const offsetY = parseFloat(ghost.dataset.offsetY || '0');

    // Calculate new position maintaining the same relative touch position
    const newX = x - offsetX;
    const newY = y - offsetY;

    ghost.style.transform = `translate3d(${newX}px, ${newY}px, 0) scale(0.9)`;
  };

  const handleDocTouchEnd = (e: TouchEvent | MouseEvent) => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
    setIsDragging(false);
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

    // Create a 1x1 transparent image for the drag ghost
    // const canvas = document.createElement('canvas');
    // canvas.width = 1;
    // canvas.height = 1;
    // const ctx = canvas.getContext('2d');
    // if (ctx) {
    //   ctx.clearRect(0, 0, 1, 1);
    // }

    // Use the empty canvas as the drag image
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    const dragGhost = createDragGhost(e, elementRef.current!);
    ghostRef.current = dragGhost;

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
      updateGhostPosition(clientX, clientY);
    });
  };

  // Add onDragEnd handler to clean up
  const handleDragEnd = () => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
    setIsDragging(false);
    log.debug('handleDragEnd', isDragging);
  };

  // log.debug('isDragging', isDragging);

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

const createDragGhost = (e: TouchEvent | MouseEvent, ref: HTMLDivElement) => {
  const rect = ref.getBoundingClientRect();
  const dragGhost = document.createElement('div');

  // Get cursor/touch position
  const isMouseEvent = e.type.includes('mouse') || e.type.includes('drag');
  const clientX = isMouseEvent
    ? (e as MouseEvent).clientX
    : (e as TouchEvent).touches[0].clientX;
  const clientY = isMouseEvent
    ? (e as MouseEvent).clientY
    : (e as TouchEvent).touches[0].clientY;

  // Calculate offset from the click/touch point to the element's top-left corner
  const offsetX = clientX - rect.left;
  const offsetY = clientY - rect.top;

  // Store the offset on the ghost element for use in updateGhostPosition
  dragGhost.dataset.offsetX = offsetX.toString();
  dragGhost.dataset.offsetY = offsetY.toString();

  // Calculate initial position maintaining the same relative touch position
  const initialX = clientX - offsetX;
  const initialY = clientY - offsetY;

  const computedStyle = window.getComputedStyle(ref);

  // Create a lightweight version that looks similar
  Object.assign(dragGhost.style, {
    position: 'fixed',
    pointerEvents: 'none',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: '1000',
    margin: '0',
    left: '0',
    top: '0',
    willChange: 'transform',
    opacity: '1',
    transform: `translate3d(${initialX}px, ${initialY}px, 0) scale(0.9)`,
    background: computedStyle.background,
    borderRadius: computedStyle.borderRadius
  });

  // If there's a thumbnail, create a simplified version
  const thumbnail = ref.querySelector('img');
  if (thumbnail) {
    const img = document.createElement('img');
    img.src = (thumbnail as HTMLImageElement).src;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = computedStyle.borderRadius;
    dragGhost.appendChild(img);
  }

  if (!isSafari) {
    document.body.appendChild(dragGhost);
  }

  return dragGhost;
};
