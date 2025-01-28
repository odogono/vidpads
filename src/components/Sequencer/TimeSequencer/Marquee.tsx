'use client';

import { createLog } from '@helpers/log';
import { Position } from '@types';

interface MarqueeProps {
  start: Position;
  end: Position;
  isDragging: boolean;
}

const log = createLog('sequencer/marquee');

export const Marquee = ({ start, end, isDragging }: MarqueeProps) => {
  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxY = Math.max(start.y, end.y);

  const left = minX;
  const top = minY;
  const width = maxX - minX;
  const height = maxY - minY;

  if (!isDragging) return null;

  return (
    <div
      className='vo-seq-marquee absolute z-10 pointer-events-none'
      style={{
        left,
        top,
        width,
        height,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    />
  );
};
