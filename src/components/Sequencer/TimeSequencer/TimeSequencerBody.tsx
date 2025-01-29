'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { quantizeSeconds } from '@/model/sequencerEvent';
import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { useSequencer } from '@model/hooks/useSequencer';
import { Pad, SequencerEvent } from '@model/types';
import { Position, Rect } from '@types';
import { Header } from './components/Header';
import { Marquee } from './components/Marquee';
import { PlayHead } from './components/PlayHead';
import { Row } from './components/Row';
import { pixelsToSeconds, secondsToPixels } from './helpers/timeConversion';
import { useGridDimensions } from './hooks/useGridDimensions';
import { useMarquee } from './hooks/useMarquee';
import { useSelectedEventsRect } from './hooks/useSelectedEventsRect';
import { useSequencerEvents } from './hooks/useSequencerEvents';
import { useTriggers } from './hooks/useTriggers';

const log = createLog('TimeSequencerBody');

export interface SequencerBodyProps {
  canvasBpm?: number;
  pixelsPerBeat?: number;
  pads: Pad[];
}

export const TimeSequencerBody = ({
  canvasBpm = 60,
  pixelsPerBeat = 16,
  pads
}: SequencerBodyProps) => {
  const padCount = pads.length;

  const events = useEvents();
  const [playHeadPosition, setPlayHeadPosition] = useState(0);

  const { gridRef, getGridDimensions } = useGridDimensions({ padCount });

  const {
    bpm,
    events: sequencerEvents,
    toggleEvent,
    moveEvents,
    // addEvent,
    // removeEvent,
    selectEvents,
    selectedEvents,
    selectedEventIds,
    endTime
  } = useSequencer();

  const timelineDurationInPixels =
    secondsToPixels(endTime, pixelsPerBeat, bpm) + pixelsPerBeat;

  const { triggers, triggerIndex } = useTriggers(
    sequencerEvents,
    pixelsPerBeat,
    canvasBpm,
    bpm
  );

  useSequencerEvents({
    setPlayHeadPosition,
    triggers,
    triggerIndex,
    pixelsPerBeat,
    bpm
  });

  const selectedEventsRect: Rect = useSelectedEventsRect({
    getGridDimensions,
    padCount,
    selectedEvents,
    pixelsPerBeat,
    canvasBpm,
    selectedEventIds
  });

  useEffect(() => {
    log.debug('TimeSequencerBody', {
      selectedEvents: selectedEvents.map((e) => e.id),
      selectedEventIds
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventIds]);

  const handleMarqueeSelectEnd = useCallback(
    (rect: Rect, isFinished?: boolean) => {
      // if (!gridRef.current) return;
      const x = Math.max(0, rect.x - 10);
      const time = pixelsToSeconds(x, pixelsPerBeat, canvasBpm);
      const duration = pixelsToSeconds(rect.width, pixelsPerBeat, canvasBpm);

      // Get the grid container's height and calculate row height
      const { rowHeight } = getGridDimensions();

      const startRowIndex = Math.floor(rect.y / rowHeight) - 1; // -1 to account for header
      const endRowIndex = Math.floor((rect.y + rect.height) / rowHeight) - 1; // -1 to account for header
      // log.debug('handleMarqueeSelectEnd', { startRowIndex, endRowIndex });

      const padIds = Array.from(
        { length: endRowIndex - startRowIndex + 1 },
        (_, index) => `a${startRowIndex + index + 1}`
      );

      if (isFinished && rect.width <= 5 && rect.height <= 5) {
        const quantizedStep = 0.5;
        const quantizedTime = quantizeSeconds(time, 0.5);
        // log.debug('toggleEvent', { padIds, time, quantizedTime });
        toggleEvent(padIds[0], quantizedTime, quantizedTime + quantizedStep);
      } else {
        selectEvents(padIds, time, duration);
      }
    },
    [canvasBpm, getGridDimensions, pixelsPerBeat, selectEvents, toggleEvent]
  );

  const handleMarqueeMoveUpdate = useCallback(
    (pos: Position, isFinished?: boolean) => {
      // convert pos to ms
      // const x = Math.max(0, pos.x - 10);
      const time = pixelsToSeconds(pos.x, pixelsPerBeat, canvasBpm);

      log.debug('handleMarqueeMoveUpdate', pos.x, time, isFinished);
      // set the playhead to the time
      // setPlayHeadPosition(time);
      if (!isFinished) {
        moveEvents(time);
      }
    },
    [canvasBpm, moveEvents, pixelsPerBeat]
  );

  const { marqueeStart, marqueeEnd, isDragging, ...marqueeEvents } = useMarquee(
    {
      onSelectUpdate: handleMarqueeSelectEnd,
      onMoveUpdate: handleMarqueeMoveUpdate,
      hasSelectedEvents: selectedEventIds.length > 0,
      selectedEventsRect
    }
  );

  const rows = useMemo(() => {
    return Array.from({ length: padCount }, (_, index) => {
      const events = sequencerEvents.filter((e) => e.padId === `a${index + 1}`);
      const rowEvents = events.map((e: SequencerEvent) => {
        const { time, duration } = e;
        // convert time to ms
        const x = secondsToPixels(time, pixelsPerBeat, canvasBpm);
        // and back to pixels so we get the scaling right
        const width = secondsToPixels(duration, pixelsPerBeat, canvasBpm);
        const id = `seq-evt-${e.padId}-${x}`;
        return { ...e, id, x, width };
      });
      return (
        <Row
          key={`row-${index}`}
          rowIndex={index}
          padId={`a${index + 1}`}
          // onTap={handleRowTap}
          // onEventDrop={handleEventDrop}
          events={rowEvents}
        />
      );
    });
  }, [canvasBpm, padCount, pixelsPerBeat, sequencerEvents]);

  const handlePlayHeadMove = useCallback(
    (pos: Position) => {
      const time = pixelsToSeconds(pos.x, pixelsPerBeat, bpm);
      // log.debug('handlePlayHeadMove', { x: pos.x, time });
      // the playhead position will be updated by a seq:time-update event
      events.emit('seq:set-time', { time });
    },
    [bpm, events, pixelsPerBeat]
  );

  // log.debug('timelineDurationInPixels', timelineDurationInPixels);

  return (
    <div
      className={`relative vo-seq-body h-full pointer-events-none`}
      style={{ width: timelineDurationInPixels }}
    >
      <PlayHead position={playHeadPosition} onMove={handlePlayHeadMove} />
      <Marquee start={marqueeStart} end={marqueeEnd} isDragging={isDragging} />
      <div
        ref={gridRef}
        className='vo-seq-grid grid grid-cols-2 w-full h-full pointer-events-auto'
        style={{
          gridTemplateColumns: `10px 1fr`,
          gridTemplateRows: `1fr repeat(${padCount}, 1fr) 0.2fr` // if this changes, then update totalFr
        }}
        {...marqueeEvents}
      >
        <Header pixelsPerBeat={pixelsPerBeat} onTap={handlePlayHeadMove} />
        {rows}
      </div>
    </div>
  );
};
