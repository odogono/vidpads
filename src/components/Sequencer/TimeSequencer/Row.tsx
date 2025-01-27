'use client';

import { useCallback } from 'react';

import { createLog } from '@helpers/log';

interface RowProps {
  padId: string;
  rowIndex: number;
  events: { x: number; width: number; padId: string }[];
  onTap: (padId: string, x: number) => void;
  // length: number;
  // stepWidth: number;
  // onTap: (padId: string, columnIndex: number) => void;
  // activeIndexes: number[];
}

const log = createLog('sequencer/row');

export const Row = ({ padId, rowIndex, events, onTap }: RowProps) => {
  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { offsetX } = e.nativeEvent;
      // log.debug('tap', padId, rowIndex, { offsetX });

      onTap(padId, offsetX);
    },
    [padId, onTap]
  );

  const handleEventTap = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement>,
      padId: string,
      x: number,
      width: number
    ) => {
      e.stopPropagation();
      e.preventDefault();
      log.debug('event tap', { padId, x, width });
    },
    []
  );

  // const isActive = activeIndexes.includes(index);
  return (
    <div
      key={`ch-${rowIndex}`}
      className={`${rowIndex % 2 === 0 ? 'bg-gray-500' : 'bg-gray-400'} relative`}
      style={{
        gridRow: `${rowIndex + 2}/${rowIndex + 2}`,
        gridColumn: `2/2`
      }}
      onMouseDown={handleTap}
    >
      {events.map(({ padId, x, width }) => (
        <div
          key={`event-${padId}-${x}`}
          className={`absolute top-0 h-full bg-red-500`}
          style={{
            left: `${x}px`,
            width: `${width}px`
          }}
          onMouseDown={(e) => handleEventTap(e, padId, x, width)}
        />
      ))}
    </div>
  );
};
