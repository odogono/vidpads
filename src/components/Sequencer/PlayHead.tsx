'use client';

import { useCallback, useRef, useState } from 'react';

import { Position } from '@types';

export interface PlayHeadProps {
  position: number;
  onMove?: (pos: Position) => void;
}

export const PlayHead = ({ position, onMove }: PlayHeadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number>(0);
  const dragStartPosition = useRef<number>(0);

  const handleDragStart = useCallback(
    (clientX: number) => {
      setIsDragging(true);
      dragStartX.current = clientX;
      dragStartPosition.current = position;
    },
    [position]
  );

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !onMove) return;

      const deltaX = clientX - dragStartX.current;
      const newPosition = Math.max(0, dragStartPosition.current + deltaX);

      onMove({ x: newPosition, y: 0 });
    },
    [isDragging, onMove]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      handleDragStart(e.clientX);
      e.stopPropagation();
    },
    [handleDragStart]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      handleDragMove(e.clientX);
      e.stopPropagation();
      e.preventDefault();
    },
    [handleDragMove]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      handleDragEnd();
    },
    [handleDragEnd]
  );

  return (
    <div
      className='absolute vo-seq-playhead w-[20px] h-full z-20'
      style={{
        left: `${1 + position}px`
      }}
    >
      <div
        className='cursor-col-resize w-0 h-0 pointer-events-auto border-x-[10px] border-x-transparent border-t-[10px] border-t-[#aaa]'
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      <div
        className='w-[1px] h-full ml-[9px] bg-white cursor-col-resize pointer-events-auto'
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
};
