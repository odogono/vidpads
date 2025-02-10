'use client';

import { cn } from '@heroui/react';
// import { createLog } from '@helpers/log';
import type { SequencerRowEvent } from './Row';

// const log = createLog('sequencer/event');

export interface SequencerEventProps extends SequencerRowEvent {
  onTap: (padId: string, x: number) => void;
}

export const Event = (props: SequencerEventProps) => {
  const { x, width, isSelected } = props;
  // const { selectedSeqEventId, setSelectedSeqEventId } = useSelectedSeqEventId();

  // const {
  //   isDragging,
  //   // setDraggingId,
  //   // dragOverId,
  //   onDragStart,
  //   onDragLeave,
  //   onDragOver,
  //   onDragEnd,
  //   onDrop
  // } = usePadDnD(id);

  // const handleTouchDown = useCallback(
  //   (e: GeneralTouchEvent) => {
  //     log.debug('handleTouchDown');
  //     e.stopPropagation();
  //     setSelectedSeqEventId(id);
  //     onTap(padId, x);
  //   },
  //   [setSelectedSeqEventId, id, onTap, padId, x]
  // );

  // const handleDragStart = useCallback(
  //   (e: GeneralDragEvent) => {
  //     log.debug('handleDragStart', id);
  //     onDragStart(e, id, MIME_TYPE_SEQ_EVENT);
  //     const data = omit(props, 'onTap', 'x', 'width');
  //     e.dataTransfer?.setData(MIME_TYPE_SEQ_EVENT, JSON.stringify(data));
  //     e.dataTransfer!.dropEffect = 'copy';
  //   },
  //   [id, onDragStart, props]
  // );

  // const handleDragEnd = useCallback(() => {
  //   // log.debug('handleDragEnd', eventId);
  //   onDragEnd(id);
  // }, [onDragEnd, id]);

  // const { ...localDragProps } = useDnD({
  //   id,
  //   onTouchDown: handleTouchDown,
  //   onDragStart: handleDragStart,
  //   onDragEnd: handleDragEnd
  // });

  // const handleDrop = useCallback(
  //   (e: GeneralDragEvent) => {
  //     // log.debug('handleDrop', id);
  //     onDrop(e, id);
  //   },
  //   [onDrop, id]
  // );

  // const dragProps = {
  //   // Native drag and drop handlers
  //   // draggable: isDraggable,
  //   onDragStart: handleDragStart,
  //   onDragEnd: handleDragEnd,
  //   onDragOver: (e: React.DragEvent<HTMLDivElement>) => onDragOver(e, id),
  //   onDragLeave: () => onDragLeave(id)
  //   // onDrop: handleDrop
  // };

  // log.debug('Event', { id, padId, x, width, isSelected });

  return (
    <div
      className={cn('vo-seq-evt absolute top-0 h-full bg-seqevt box-border', {
        'border-2 border-white': isSelected
      })}
      style={{
        left: `${x}px`,
        width: `${width}px`
      }}
      // {...localDragProps}
      // {...dragProps}
    />
  );
};
