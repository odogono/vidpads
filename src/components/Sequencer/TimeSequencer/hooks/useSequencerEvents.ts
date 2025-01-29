'use client';

import { RefObject, useCallback, useEffect } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { secondsToPixels } from '../helpers/timeConversion';
import { TriggerEvent } from '../types';

interface UseSequencerEventsProps {
  setPlayHeadPosition: (position: number) => void;
  triggers: TriggerEvent[];
  triggerIndex: RefObject<number>;
  pixelsPerBeat: number;
  bpm: number;
}

const log = createLog('seq/useSequencerEvents');

export const useSequencerEvents = ({
  setPlayHeadPosition,
  triggers,
  triggerIndex,
  pixelsPerBeat,
  bpm
}: UseSequencerEventsProps) => {
  const events = useEvents();

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
