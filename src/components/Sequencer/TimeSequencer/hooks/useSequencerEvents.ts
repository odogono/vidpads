'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { SequencerEvent } from '@model/types';
import {
  msToPixels,
  pixelsToMs,
  secondsToPixels
} from '../helpers/timeConversion';
import { TriggerEvent } from '../types';

interface UseSequencerEventsProps {
  setPlayHeadPosition: (position: number) => void;
  pixelsPerBeat: number;
  bpm: number;
  canvasBpm: number;
  sequencerEvents: SequencerEvent[];
  sequencerEventIds: string;
}

const log = createLog('seq/useSequencerEvents');

export const useSequencerEvents = ({
  setPlayHeadPosition,
  pixelsPerBeat,
  bpm,
  canvasBpm,
  sequencerEvents,
  sequencerEventIds
}: UseSequencerEventsProps) => {
  const events = useEvents();
  const triggerIndex = useRef(0);

  const { triggers } = useMemo(() => {
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

    return { triggers: result };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequencerEventIds, pixelsPerBeat, canvasBpm, bpm]);

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
    [bpm, events, pixelsPerBeat, setPlayHeadPosition, triggerIndex, triggers]
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
    [triggerIndex, triggers]
  );

  useEffect(() => {
    events.on('seq:time-set', handleTimeSet);
    events.on('seq:time-update', handleTimeUpdate);
    return () => {
      events.off('seq:time-set', handleTimeSet);
      events.off('seq:time-update', handleTimeUpdate);
    };
  }, [events, handleTimeSet, handleTimeUpdate]);

  return events;
};
