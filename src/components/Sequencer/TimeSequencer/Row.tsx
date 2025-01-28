'use client';

import { useCallback, useState } from 'react';

import { createLog } from '@helpers/log';
import { MIME_TYPE_PAD, MIME_TYPE_SEQ_EVENT } from '@hooks/usePadDnD/constants';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { SequencerEvent } from '@model/types';
import { GeneralDragEvent, getClientPosition, getOffset } from '@types';
import { Event } from './Event';

export interface SequencerRowEvent extends SequencerEvent {
  id: string;
  x: number;
  width: number;
}

interface RowProps {
  padId: string;
  rowIndex: number;
  events: SequencerRowEvent[];
  onTap: (padId: string, x: number) => void;
  // length: number;
  // stepWidth: number;
  // onTap: (padId: string, columnIndex: number) => void;
  // activeIndexes: number[];
}

const log = createLog('sequencer/row');

export const Row = ({ padId, rowIndex, events, onTap }: RowProps) => {
  const id = `seq-row-${padId}`;

  const handleDrop = useCallback((e: GeneralDragEvent) => {
    const data = e.dataTransfer?.getData(MIME_TYPE_SEQ_EVENT);
    if (data) {
      log.debug('handleDrop', data, e.dataTransfer?.dropEffect);
    }
  }, []);

  const { isDragging, dragOverId, onDragLeave, onDragOver, onDrop } =
    usePadDnD(id);

  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { offsetX } = e.nativeEvent;
      // log.debug('tap', padId, rowIndex, { offsetX });

      onTap(padId, offsetX);
    },
    [padId, onTap]
  );

  const handleEventTap = useCallback((padId: string, x: number) => {
    log.debug('event tap', { padId, x });
  }, []);

  const bgColor = rowIndex % 2 === 0 ? 'bg-gray-500' : 'bg-gray-400';
  if (dragOverId === `seq-row-${padId}`) {
    // bgColor = 'bg-gray-300';
  }

  return (
    <div
      key={`ch-${rowIndex}`}
      className={`${bgColor} relative`}
      style={{
        gridRow: `${rowIndex + 2}/${rowIndex + 2}`,
        gridColumn: `2/2`
      }}
      onMouseDown={handleTap}
      onDragOver={(e) => onDragOver(e, id)}
      onDragLeave={() => onDragLeave(id)}
      onDrop={(e) => {
        onDrop(e, id);
        handleDrop(e);
      }}
    >
      {events.map((event) => (
        <Event
          key={`event-${padId}-${event.x}`}
          {...event}
          onTap={handleEventTap}
        />
      ))}
    </div>
  );
};
