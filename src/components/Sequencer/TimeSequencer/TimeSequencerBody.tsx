'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

// import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { useSequencer } from '@model/hooks/useSequencer';
import { Pad, SequencerEvent } from '@model/types';
import { Position, Rect } from '@types';
import { quantizeSeconds } from '../../../model/sequencerEvent';
import { Header } from './components/Header';
import { Marquee } from './components/Marquee';
import { PlayHead } from './components/PlayHead';
import { Row } from './components/Row';
import { pixelsToSeconds, secondsToPixels } from './helpers/timeConversion';
import { useGridDimensions } from './hooks/useGridDimensions';
import { useMarquee } from './hooks/useMarquee';
import { useSelectedEventsRect } from './hooks/useSelectedEventsRect';
import { useSequencerEvents } from './hooks/useSequencerEvents';

// const log = createLog('TimeSequencerBody');

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

  // records the duration of the last event toggled
  const [lastEventDuration, setLastEventDuration] = useState(0.5);

  const {
    bpm,
    events: sequencerEvents,
    eventIds: sequencerEventIds,
    moveEvents,
    addEvent,
    getEventsAtTime,
    selectEvents,
    selectEventsAtTime,
    selectedEvents,
    selectedEventIds,
    endTime
  } = useSequencer();

  const timelineDurationInPixels =
    secondsToPixels(endTime, pixelsPerBeat, bpm) + pixelsPerBeat;

  useSequencerEvents({
    sequencerEvents,
    sequencerEventIds,
    setPlayHeadPosition,
    pixelsPerBeat,
    bpm,
    canvasBpm
  });

  const selectedEventsRect: Rect = useSelectedEventsRect({
    getGridDimensions,
    padCount,
    selectedEvents,
    pixelsPerBeat,
    canvasBpm,
    selectedEventIds
  });

  // useEffect(() => {
  //   log.debug('TimeSequencerBody', {
  //     selectedEvents: selectedEvents.map((e) => e.id),
  //     selectedEventIds
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedEventIds]);

  const convertGridRectToTime = useCallback(
    (rect: Rect) => {
      const x = Math.max(0, rect.x - 10);
      const time = pixelsToSeconds(x, pixelsPerBeat, canvasBpm);
      const duration = pixelsToSeconds(rect.width, pixelsPerBeat, canvasBpm);

      const { rowHeight } = getGridDimensions();
      const startRowIndex = Math.floor(rect.y / rowHeight) - 1;
      const endRowIndex = Math.floor((rect.y + rect.height) / rowHeight) - 1;

      const padIds = Array.from(
        { length: endRowIndex - startRowIndex + 1 },
        (_, index) => `a${startRowIndex + index + 1}`
      );

      return { time, duration, padIds };
    },
    [pixelsPerBeat, canvasBpm, getGridDimensions]
  );

  const convertYToPadId = useCallback(
    (y: number) => {
      const { rowHeight } = getGridDimensions();
      const rowIndex = Math.floor(y / rowHeight) - 1;
      return { rowIndex, padId: `a${rowIndex + 1}` };
    },
    [getGridDimensions]
  );

  const handleMarqueeSelectEnd = useCallback(
    (rect: Rect, isFinished?: boolean, isLongPress?: boolean) => {
      const { time, duration, padIds } = convertGridRectToTime(rect);

      const hasSelectedEvents = selectedEventIds.length > 0;

      if (isFinished) {
        if (isLongPress) {
          // On long press, create a 1-beat event
          // const quantizedStep = (60 / canvasBpm) * 2; // One beat duration
          // const quantizedTime = quantizeSeconds(time, 0.5);
          // toggleEvent(padIds[0], quantizedTime, quantizedTime + quantizedStep);
          // log.debug('handleMarqueeSelectEnd long press', rect);
        } else if (rect.width <= 5 && rect.height <= 5) {
          if (hasSelectedEvents) {
            // deselect all events
            selectEventsAtTime([], -1, -1);
          } else {
            const eventsAtTime = getEventsAtTime(padIds[0], time);

            if (eventsAtTime.length > 0) {
              const lastEvent = eventsAtTime[eventsAtTime.length - 1];
              const evtDuration = lastEvent?.duration ?? 0.5;
              setLastEventDuration(evtDuration);
              // selectEvents(eventsAtTime, lastEvent.time, evtDuration);
              selectEvents(eventsAtTime.slice(0, 1));
            } else {
              addEvent(padIds[0], quantizeSeconds(time, 4), lastEventDuration);
            }

            // const quantizedTime = quantizeSeconds(time, 0.5);
            // toggleEvent(padIds[0], time, time + lastEventDuration);
          }
        } else {
          // Normal marquee selection
          selectEventsAtTime(padIds, time, duration);
        }
      }
    },
    [
      convertGridRectToTime,
      selectedEventIds.length,
      selectEventsAtTime,
      getEventsAtTime,
      selectEvents,
      lastEventDuration,
      addEvent
    ]
  );

  const handleLongPressDown = useCallback(
    (rect: Rect, isFinished?: boolean) => {
      const { time, duration, padIds } = convertGridRectToTime(rect);
      // log.debug(
      //   'handleLongPressDown',
      //   { time, duration, padIds, y: rect.y },
      //   isFinished
      // );
      if (!isFinished) {
        selectEventsAtTime(padIds, time, duration);
      }
    },
    [convertGridRectToTime, selectEventsAtTime]
  );

  const moveRowIndex = useRef(-1);
  const handleMarqueeMoveUpdate = useCallback(
    (pos: Position, start: Position, isFinished?: boolean) => {
      // convert pos to ms
      const time = pixelsToSeconds(pos.x, pixelsPerBeat, canvasBpm);

      // const startRowIndex = convertYToPadId(start.y).rowIndex;
      const currentRowIndex = convertYToPadId(start.y + pos.y).rowIndex;

      if (moveRowIndex.current === -1) {
        moveRowIndex.current = currentRowIndex;
      }
      const rowDelta = currentRowIndex - moveRowIndex.current;

      moveRowIndex.current = currentRowIndex;
      // const { rowIndex, padId } = convertYToPadId(start.y + pos.y);
      // const quantizedTime = quantizeSeconds(time, 0.5);

      // if (rowDelta !== 0)
      //   log.debug(
      //     'handleMarqueeMoveUpdate',
      //     { y: pos.y, sy: start.y, startRowIndex, currentRowIndex, rowDelta },
      //     time,
      //     isFinished
      //   );

      moveEvents(isFinished ? 0 : time, rowDelta, isFinished);

      if (isFinished) {
        moveRowIndex.current = -1;
      }
    },
    [canvasBpm, convertYToPadId, moveEvents, pixelsPerBeat]
  );

  const {
    marqueeStart,
    marqueeEnd,
    isDragging,
    isLongTouch,
    ...marqueeEvents
  } = useMarquee({
    onLongPressDown: handleLongPressDown,
    onSelectUpdate: (rect: Rect, isFinished?: boolean) =>
      handleMarqueeSelectEnd(rect, isFinished, isLongTouch),
    onMoveUpdate: handleMarqueeMoveUpdate,
    hasSelectedEvents: selectedEventIds.length > 0,
    selectedEventsRect
  });

  const rows = useMemo(() => {
    // log.debug('events', sequencerEvents.length, sequencerEvents);
    return Array.from({ length: padCount }, (_, index) => {
      const events = sequencerEvents.filter((e) => e.padId === `a${index + 1}`);
      const rowEvents = events.map((e: SequencerEvent) => {
        const { time, duration } = e;
        // convert time to ms
        const x = secondsToPixels(time, pixelsPerBeat, canvasBpm);
        // and back to pixels so we get the scaling right
        const width = secondsToPixels(duration, pixelsPerBeat, canvasBpm);
        // const id = `seq-evt-${e.padId}-${e.id}`;
        return { ...e, x, width };
      });
      // log.debug(
      //   'rowEvents',
      //   `a${index + 1}`,
      //   rowEvents.length,
      //   sequencerEvents.length
      // );
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
    // stop constant re-rendering from sequencerEvents
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasBpm, padCount, pixelsPerBeat, sequencerEventIds]);

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
        <div
          className='vo-seq-selected-evts-rect absolute pointer-events-none bg-black opacity-20'
          style={{
            left: selectedEventsRect.x,
            top: selectedEventsRect.y,
            width: selectedEventsRect.width,
            height: selectedEventsRect.height
          }}
        />
      </div>
    </div>
  );
};
