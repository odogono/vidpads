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
  const initialPosRef = useRef<Position>({ x: 0, y: 0 });
  // const dragPositionRef = useRef<Position>({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const { dragGhost, initialPos } = createDragGhost(e, elementRef.current!);
    ghostRef.current = dragGhost;
    initialPosRef.current = initialPos;
    // dragPositionRef.current = position;
    log.debug('handleTouchStart', isDragging);
  };

  const handleTouchMove = (e: TouchEvent | MouseEvent) => {
    const isMouseEvent = e.type.includes('mouse');
    const mouseEvent = e as MouseEvent;
    const touchEvent = e as TouchEvent;
    const clientX = isMouseEvent
      ? mouseEvent.clientX
      : touchEvent.touches[0].clientX;
    const clientY = isMouseEvent
      ? mouseEvent.clientY
      : touchEvent.touches[0].clientY;
    updateGhostPosition(clientX, clientY);
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

    // Instead of calculating deltas, directly set the position relative to the cursor
    const ghostWidth = ghostRef.current.offsetWidth;
    const ghostHeight = ghostRef.current.offsetHeight;

    // Center the ghost element on the cursor
    const newX = x - ghostWidth / 2;
    const newY = y - ghostHeight / 2;

    ghostRef.current.style.transform = 'scale(0.8)';
    ghostRef.current.style.left = `${newX}px`;
    ghostRef.current.style.top = `${newY}px`;

    // const deltaX = x - initialPosRef.current.x;
    // const deltaY = y - initialPosRef.current.y;

    // const newX = dragPositionRef.current.x + deltaX;
    // const newY = dragPositionRef.current.y + deltaY;

    // ghostRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.8)`;

    // dragPositionRef.current = { x: newX, y: newY };
    // log.debug('updateGhostPosition', ghostRef.current.style.transform);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleTouchEnd);
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('mousemove', handleTouchMove);
      document.addEventListener('touchmove', handleTouchMove, {
        passive: false
      });
    }

    return () => {
      document.removeEventListener('mouseup', handleTouchEnd);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleTouchMove);
      document.removeEventListener('touchmove', handleTouchMove);
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
  const dragGhost = ref.cloneNode(true) as HTMLDivElement;
  dragGhost.style.opacity = '1';
  dragGhost.style.transform = 'scale(0.8)';
  dragGhost.style.position = 'fixed';
  dragGhost.style.pointerEvents = 'none';
  dragGhost.style.left = `${rect.left}px`;
  dragGhost.style.top = `${rect.top}px`;
  dragGhost.style.width = `${rect.width}px`;
  dragGhost.style.height = `${rect.height}px`;
  dragGhost.style.zIndex = '1000';
  dragGhost.style.margin = '0';

  document.body.appendChild(dragGhost);
  // e.dataTransfer.setDragImage(dragGhost, 0, 0);
  // requestAnimationFrame(() => {
  //   document.body.removeChild(dragGhost);
  // });
  const isMouseEvent = e.type.includes('mouse');
  const mouseEvent = e as MouseEvent;
  const touchEvent = e as TouchEvent;

  const clientX = isMouseEvent
    ? mouseEvent.clientX
    : touchEvent.touches[0].clientX;
  const clientY = isMouseEvent
    ? mouseEvent.clientY
    : touchEvent.touches[0].clientY;
  // setInitialMousePos({ x: clientX, y: clientY });
  // setPosition({ x: rect.left, y: rect.top });

  dragGhost.style.left = `${clientX - rect.width / 2}px`;
  dragGhost.style.top = `${clientY - rect.height / 2}px`;

  const initialPos = { x: clientX, y: clientY };
  const position = { x: rect.left, y: rect.top };

  return { dragGhost, initialPos, position };
};
