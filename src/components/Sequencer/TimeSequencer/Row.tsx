'use client';

import { useCallback, useState } from 'react';

import { createLog } from '@helpers/log';
import {
  MIME_TYPE_DROP_EFFECT,
  MIME_TYPE_PAD,
  MIME_TYPE_SEQ_EVENT
} from '@hooks/usePadDnD/constants';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { useStore } from '@model/store/useStore';
import { SequencerEvent } from '@model/types';
import {
  GeneralDragEvent,
  Position,
  getClientPosition,
  getOffset
} from '@types';
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
  onEventDrop: (
    sourceEvent: SequencerEvent,
    rowPadId: string,
    pos: Position,
    dropEffect: string
  ) => void;
  // length: number;
  // stepWidth: number;
  // onTap: (padId: string, columnIndex: number) => void;
  // activeIndexes: number[];
}

const log = createLog('sequencer/row');

export const Row = ({
  padId,
  rowIndex,
  events,
  onTap,
  onEventDrop
}: RowProps) => {
  const id = `seq-row-${padId}`;

  const handleDrop = useCallback(
    (e: GeneralDragEvent) => {
      const data = e.dataTransfer?.getData(MIME_TYPE_SEQ_EVENT);
      const dropEffect = e.dataTransfer?.getData(MIME_TYPE_DROP_EFFECT);
      log.debug('handleDrop', id, data, dropEffect);
      if (data) {
        const { x, y } = getOffset(e);
        const event = JSON.parse(data);

        onEventDrop(event, padId, { x, y }, dropEffect ?? 'move');
      }
    },
    [id, onEventDrop, padId]
  );

  const { isDragging, dragOverId, onDragLeave, onDragOver, onDrop } =
    usePadDnD(id);

  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { offsetX } = e.nativeEvent;
      // log.debug('tap', padId, rowIndex, { offsetX });

      // onTap(padId, offsetX);
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
