'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { useSequencer } from '@model/hooks/useSequencer';
import { getPadInterval } from '@model/pad';
import { Interval, Pad, SequencerEvent } from '@model/types';
import { Position, Rect } from '@types';
import { quantizeSeconds } from '../../../model/sequencerEvent';
import { PlayHead } from '../PlayHead';
import { Header } from './Header';
import { Marquee } from './Marquee';
import { Row } from './Row';
import { useMarquee } from './useMarquee';

const log = createLog('TimeSequencerBody');

interface TriggerEvent {
  event: 'pad:touchdown' | 'pad:touchup';
  time: number;
  padId: string;
}
export interface SequencerBodyProps {
  pads: Pad[];
}

const pixelsToMs = (pixels: number, pixelsPerBeat: number, bpm: number) => {
  const beats = pixels / pixelsPerBeat;
  return (beats * 60000) / bpm;
};

const pixelsToSeconds = (
  pixels: number,
  pixelsPerBeat: number,
  bpm: number
) => {
  return pixelsToMs(pixels, pixelsPerBeat, bpm) / 1000;
};

const msToPixels = (ms: number, pixelsPerBeat: number, bpm: number) => {
  const beats = (bpm / 60000) * ms;
  return beats * pixelsPerBeat;
};

const secondsToPixels = (
  seconds: number,
  pixelsPerBeat: number,
  bpm: number
) => {
  return msToPixels(seconds * 1000, pixelsPerBeat, bpm);
};

export const TimeSequencerBody = ({ pads }: SequencerBodyProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const padCount = pads.length;

  // at 60 bpm, 1 beat is one second
  const pixelsPerBeat = 16;
  const canvasBpm = 60;

  const events = useEvents();
  const {
    bpm,
    events: sequencerEvents,
    toggleEvent,
    moveEvents,
    addEvent,
    removeEvent,
    selectEvents,
    selectedEvents,
    selectedEventIds,
    startTime,
    endTime
  } = useSequencer();

  const timelineDurationInPixels =
    secondsToPixels(endTime, pixelsPerBeat, bpm) + pixelsPerBeat;

  const selectedEventsRect = useMemo(() => {
    if (!gridRef.current) return { x: 0, y: 0, width: 0, height: 0 };

    const gridHeight = gridRef.current.clientHeight;

    const totalFr = 1 + padCount + 0.2;
    const rowHeight = gridHeight / totalFr;

    const { minX, minY, maxX, maxY } = selectedEvents.reduce(
      (acc, e) => {
        const { time, duration } = e;
        const x = secondsToPixels(time, pixelsPerBeat, canvasBpm);
        const width = secondsToPixels(duration, pixelsPerBeat, canvasBpm);

        const y = rowHeight * Number(e.padId.substring(1));
        const height = rowHeight;

        acc.minX = Math.min(acc.minX, x);
        acc.minY = Math.min(acc.minY, y);
        acc.maxX = Math.max(acc.maxX, x + width);
        acc.maxY = Math.max(acc.maxY, y + height);

        return acc;
      },
      {
        minX: Number.MAX_VALUE,
        minY: Number.MAX_VALUE,
        maxX: -Number.MAX_VALUE,
        maxY: -Number.MAX_VALUE
      }
    );

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [padCount, selectedEventIds]);

  useEffect(() => {
    log.debug('TimeSequencerBody', {
      selectedEvents: selectedEvents.map((e) => e.id),
      selectedEventIds
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventIds]);

  const handleMarqueeSelectEnd = useCallback(
    (rect: Rect, isFinished?: boolean) => {
      if (!gridRef.current) return;
      const x = Math.max(0, rect.x - 10);
      const time = pixelsToSeconds(x, pixelsPerBeat, canvasBpm);
      const duration = pixelsToSeconds(rect.width, pixelsPerBeat, canvasBpm);

      // Get the grid container's height and calculate row height

      const gridHeight = gridRef.current.clientHeight;

      const totalFr = 1 + padCount + 0.2;
      const rowHeight = gridHeight / totalFr;

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
    [canvasBpm, padCount, pixelsPerBeat, selectEvents, toggleEvent]
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
    [moveEvents]
  );

  const { marqueeStart, marqueeEnd, isDragging, ...marqueeEvents } = useMarquee(
    {
      onSelectUpdate: handleMarqueeSelectEnd,
      onMoveUpdate: handleMarqueeMoveUpdate,
      hasSelectedEvents: selectedEventIds.length > 0,
      selectedEventsRect
    }
  );

  // const stepWidth = 40;
  const [playHeadPosition, setPlayHeadPosition] = useState(0);

  const { triggers, triggerKey } = useMemo(() => {
    const result = sequencerEvents.reduce((acc, e) => {
      if (!e) return acc;
      const { time, duration, padId } = e;

      const adjTime = pixelsToMs(
        msToPixels(time, pixelsPerBeat, canvasBpm),
        pixelsPerBeat,
        bpm
      );
      const adjDuration = pixelsToMs(
        msToPixels(duration, pixelsPerBeat, canvasBpm),
        pixelsPerBeat,
        bpm
      );

      acc.push({ event: 'pad:touchdown', time: adjTime, padId });
      acc.push({ event: 'pad:touchup', time: adjTime + adjDuration, padId });
      return acc;
    }, [] as TriggerEvent[]);

    // result.sort((a, b) => a.time - b.time);
    // log.debug('triggers', result);
    const triggerKey = result.map((e) => e.time).join(',');
    return { triggers: result, triggerKey };
    // todo - this calls every render
  }, [bpm, sequencerEvents]);

  const triggerIndex = useRef(0);

  const handleEventDrop = useCallback(
    (
      sourceEvent: SequencerEvent,
      rowPadId: string,
      { x }: Position,
      dropEffect: string
    ) => {
      if (dropEffect === 'move') {
        // delete the source event
        removeEvent(rowPadId, sourceEvent.time);
      }

      // convert x to ms - 10px to account for the gutter
      const time = pixelsToMs(x - 10, pixelsPerBeat, bpm);

      // add the source event to the row
      addEvent(rowPadId, time, sourceEvent.duration);
    },
    [removeEvent, bpm, addEvent]
  );

  // const handleRowTap = useCallback(
  //   (padId: string, x: number) => {
  //     // dont need to subtract gutter because its a pointer position
  //     const time = pixelsToMs(x, pixelsPerBeat, bpm);

  //     const pad = pads.find((p) => p.id === padId);
  //     const interval = getPadInterval(pad, { start: 0, end: -1 }) as Interval;

  //     const duration =
  //       interval.end === -1 ? 1000 : (interval.end - interval.start) * 1000;

  //     addEvent(padId, time, duration);

  //     log.debug('row tapped', padId, x, { time, duration, interval });
  //     // toggleEvent(padId, ms, ms + 1);
  //   },
  //   [bpm, pads, addEvent]
  // );

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
          onEventDrop={handleEventDrop}
          events={rowEvents}
        />
      );
    });
  }, [handleEventDrop, padCount, sequencerEvents]);

  const handleTimeUpdate = useCallback(
    (event: { time: number }) => {
      const { time } = event;
      const playHeadPosition = secondsToPixels(time, pixelsPerBeat, bpm);
      setPlayHeadPosition(playHeadPosition);
      // log.debug('handleTimeUpdate', { time, playHeadPosition, bpm });

      const nextTrigger = triggers[triggerIndex.current];
      if (nextTrigger) {
        const nextTriggerTime = nextTrigger.time;
        if (time >= nextTriggerTime) {
          const { event, padId } = nextTrigger;
          events.emit(event, { padId });
          triggerIndex.current++;
          // log.debug('handleTimeUpdate', {
          //   time,
          //   event,
          //   padId
          // });
        }
      }
    },
    [bpm, events, triggers]
  );

  const handleTimeSet = useCallback(
    (event: { time: number }) => {
      const { time } = event;
      triggerIndex.current = 0;
      for (let i = 0; i < triggers.length; i++) {
        const trigger = triggers[i];
        if (trigger.time >= time) {
          triggerIndex.current = i;
          break;
        }
      }
      // log.debug('handleTimeSet', {
      //   time,
      //   triggerKey,
      //   index: triggerIndex.current
      // });
    },
    [triggers]
  );

  const handlePlayHeadMove = useCallback(
    (pos: Position) => {
      const time = pixelsToMs(pos.x, pixelsPerBeat, bpm);
      // the playhead position will be updated by a seq:time-update event
      events.emit('seq:set-time', { time });
    },
    [bpm, events]
  );

  useEffect(() => {
    events.on('seq:time-set', handleTimeSet);
    events.on('seq:time-update', handleTimeUpdate);
    return () => {
      events.off('seq:time-set', handleTimeSet);
      events.off('seq:time-update', handleTimeUpdate);
    };
  }, [events, handleTimeSet, handleTimeUpdate]);

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
