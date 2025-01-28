'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { useSequencer } from '@model/hooks/useSequencer';
import { getPadInterval } from '@model/pad';
import { Interval, Pad, SequencerEvent } from '@model/types';
import { Position } from '../../../types';
import { PlayHead } from '../PlayHead';
import { Row } from './Row';

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

const msToPixels = (ms: number, pixelsPerBeat: number, bpm: number) => {
  const beats = (bpm / 60000) * ms;
  return beats * pixelsPerBeat;
};

export const TimeSequencerBody = ({ pads }: SequencerBodyProps) => {
  const events = useEvents();
  const {
    bpm,
    events: sequencerEvents,
    toggleEvent,
    timeToStep,
    addEvent,
    removeEvent
  } = useSequencer();

  const padCount = pads.length;

  // at 60 bpm, 1 beat is one second
  const pixelsPerBeat = 16;

  const canvasBpm = 60;

  // const pixelsToMs = useCallback(
  //   (x: number) => {
  //     const beats = x / pixelsPerBeat;
  //     return (beats * 60000) / bpm;
  //   },
  //   [bpm, pixelsPerBeat]
  // );

  // const msToPixels = useCallback(
  //   (ms: number) => {
  //     const beats = (bpm / 60000) * ms;
  //     return beats * pixelsPerBeat;
  //   },
  //   [bpm, pixelsPerBeat]
  // );

  const timelineDurationInPixels = msToPixels(
    180 * 1000,
    pixelsPerBeat,
    canvasBpm
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

    result.sort((a, b) => a.time - b.time);
    // log.debug('triggers', result);
    const triggerKey = result.map((e) => e.time).join(',');
    return { triggers: result, triggerKey };
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

  const handleRowTap = useCallback(
    (padId: string, x: number) => {
      // dont need to subtract gutter because its a pointer position
      const time = pixelsToMs(x, pixelsPerBeat, bpm);

      const pad = pads.find((p) => p.id === padId);
      const interval = getPadInterval(pad, { start: 0, end: -1 }) as Interval;

      const duration =
        interval.end === -1 ? 1000 : (interval.end - interval.start) * 1000;

      addEvent(padId, time, duration);

      log.debug('row tapped', padId, x, { time, duration, interval });
      // toggleEvent(padId, ms, ms + 1);
    },
    [bpm, pads, addEvent]
  );

  const rows = useMemo(() => {
    return Array.from({ length: padCount }, (_, index) => {
      const events = sequencerEvents.filter((e) => e.padId === `a${index + 1}`);
      const rowEvents = events.map((e: SequencerEvent) => {
        const { time, duration } = e;
        // convert time to ms
        const x = msToPixels(time, pixelsPerBeat, canvasBpm);
        // and back to pixels so we get the scaling right
        const width = msToPixels(duration, pixelsPerBeat, canvasBpm);
        const id = `seq-evt-${e.padId}-${x}`;
        return { ...e, id, x, width };
      });
      return (
        <Row
          key={`row-${index}`}
          rowIndex={index}
          padId={`a${index + 1}`}
          onTap={handleRowTap}
          onEventDrop={handleEventDrop}
          events={rowEvents}
        />
      );
    });
  }, [handleRowTap, padCount, sequencerEvents]);

  const handleTimeUpdate = useCallback(
    (event: { time: number }) => {
      const { time } = event;

      // convert time in milliseconds to bpm
      const playHeadPosition = msToPixels(time, pixelsPerBeat, canvasBpm);
      // const convertedTime = (bpm / 60000) * time;
      // const playHeadPosition = convertedTime * pixelsPerBeat;

      // const beatLength = pixelsPerBeat bpm / 6000;

      // const stepPosition = timeToStep(time);
      setPlayHeadPosition(playHeadPosition);

      // log.debug('handleTimeUpdate', {
      //   time,
      //   convertedTime
      // });

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
    [events, triggers]
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
      className={`relative vo-seq-body h-full`}
      style={{ width: timelineDurationInPixels }}
    >
      <PlayHead position={playHeadPosition} />
      <div
        className='grid grid-cols-2 w-full h-full '
        style={{
          gridTemplateColumns: `10px 1fr`,
          gridTemplateRows: `1fr repeat(${padCount}, 1fr) 0.2fr`
        }}
      >
        <Header pixelsPerBeat={pixelsPerBeat} />

        {rows}
      </div>
    </div>
  );
};

interface HeaderProps {
  pixelsPerBeat: number;
}

const Header = ({ pixelsPerBeat }: HeaderProps) => {
  return (
    <div
      className='vo-seq-header relative'
      style={{
        gridColumn: '2/2',
        backgroundSize: 'auto 30%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom',
        backgroundImage: `repeating-linear-gradient(
        to right,
      transparent 0px,
      transparent ${pixelsPerBeat - 1}px,
      #aaa ${pixelsPerBeat - 1}px,
      #aaa ${pixelsPerBeat}px
        )`
      }}
    >
      <div
        className='absolute top-0 left-0 right-0 bottom-0'
        style={{
          backgroundSize: 'auto 60%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom',
          backgroundImage: `repeating-linear-gradient(
            to right, 
            transparent 0px,
            transparent ${pixelsPerBeat * 4 - 1}px,
            #aaa ${pixelsPerBeat * 4 - 1}px,
            #aaa ${pixelsPerBeat * 4}px
          )`
        }}
      ></div>
    </div>
  );
};
