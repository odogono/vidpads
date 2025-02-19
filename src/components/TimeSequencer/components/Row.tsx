'use client';

import { cn } from '@helpers/tailwind';
// import { createLog } from '@helpers/log';
import { SequencerEvent } from '@model/types';
import { Position } from '@types';
import { Event } from './Event';

export interface SequencerRowEvent extends SequencerEvent {
  x: number;
  width: number;
}

interface RowProps {
  padId: string;
  rowIndex: number;
  events: SequencerRowEvent[];
  onTap?: (padId: string, x: number) => void;
  onEventDrop?: (
    sourceEvent: SequencerEvent,
    rowPadId: string,
    pos: Position,
    dropEffect: string
  ) => void;
}

export const Row = ({ padId, rowIndex, events }: RowProps) => {
  return (
    <div
      key={`ch-${rowIndex}`}
      className={cn('vo-seq-row relative pointer-events-none', {
        'bg-gray-500': rowIndex % 2 === 0,
        'bg-gray-400': rowIndex % 2 !== 0
      })}
      style={{
        gridRow: `${rowIndex + 2}/${rowIndex + 2}`,
        gridColumn: `2/2`
      }}
    >
      {events.map((event) => (
        <Event key={`evt-${padId}-${event.id}`} {...event} />
      ))}
    </div>
  );
};
