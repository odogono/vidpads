import { useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useMousePosition } from '@hooks/useMousePosition';
import type { Pad } from '@model/types';
import { getThumbnailFromUrl, useThumbnail } from '../model/db/api';
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

  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const dragGhost = createDragGhost(e, elementRef.current!);
    ghostRef.current = dragGhost;
    log.debug('handleTouchStart', isDragging);
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

    const ghostWidth = ghost.offsetWidth;
    const ghostHeight = ghost.offsetHeight;

    // Use translate3d for hardware acceleration
    const newX = x - ghostWidth / 2;
    const newY = y - ghostHeight / 2;

    ghost.style.transform = `translate3d(${newX}px, ${newY}px, 0) scale(0.8)`;

    // log.debug('updateGhostPosition', ghost.style.left, ghost.style.top);
    // log.debug('updateGhostPosition', ghost.style.transform);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleTouchEnd);
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('mousemove', handleTouchMove);
      // document.addEventListener('touchmove', handleTouchMove, {
      // passive: false
      // });
    }

    return () => {
      document.removeEventListener('mouseup', handleTouchEnd);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleTouchMove);
      // document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/pad-id', pad.id);
    e.dataTransfer.effectAllowed = 'move';

    // Create an invisible drag ghost
    const dragGhost = document.createElement('div');
    dragGhost.style.opacity = '0';
    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, 0, 0);
    requestAnimationFrame(() => {
      document.body.removeChild(dragGhost);
    });

    setIsDragging(true);
    onPadDragStart(pad.id);
    log.debug('dragging pad', pad.id);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    log.debug('handleDrop', e);
    // onDrop(e, pad.id);
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
        onTouchStart={handleTouchStart}
        onMouseDown={handleTouchStart}
        onDragOver={(e) => onDragOver(e, pad.id)}
        onDragLeave={onDragLeave}
        draggable={!!thumbnail}
        onDragStart={handleDragStart}
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
  const isMouseEvent = e.type.includes('mouse');
  const clientX = isMouseEvent
    ? (e as MouseEvent).clientX
    : (e as TouchEvent).touches[0].clientX;
  const clientY = isMouseEvent
    ? (e as MouseEvent).clientY
    : (e as TouchEvent).touches[0].clientY;

  // Calculate initial position
  const initialX = clientX - rect.width / 2;
  const initialY = clientY - rect.height / 2;

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
    opacity: '0.8',
    transform: `translate3d(${initialX}px, ${initialY}px, 0) scale(0.8)`,
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

  document.body.appendChild(dragGhost);
  return dragGhost;
};
