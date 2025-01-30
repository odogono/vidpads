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
import {
  TriggerNode,
  findTriggerEventsWithinTimeRange,
  insertTriggerEvent
} from '../helpers/triggerEvent';

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

  // creates a binary tree of trigger events
  const triggerTree: TriggerNode | undefined = useMemo(() => {
    const result = sequencerEvents.reduce(
      (tree, e) => {
        if (!e) return tree;
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

        tree = insertTriggerEvent(tree, {
          event: 'pad:touchdown',
          time: adjTime,
          padId
        });
        tree = insertTriggerEvent(tree, {
          event: 'pad:touchup',
          time: adjTime + adjDuration,
          padId
        });
        return tree;
      },
      undefined as TriggerNode | undefined
    );

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequencerEventIds, pixelsPerBeat, canvasBpm, bpm]);

  const lastTimeUpdate = useRef(0);
  const handleTimeUpdate = useCallback(
    (event: { time: number; isPlaying: boolean }) => {
      const { time, isPlaying } = event;
      const playHeadPosition = secondsToPixels(time, pixelsPerBeat, bpm);
      setPlayHeadPosition(playHeadPosition);

      if (!isPlaying) {
        lastTimeUpdate.current = time;
        return;
      }

      // get all of the events between the last time this was called
      // and the current time
      const startTime = Math.min(time, lastTimeUpdate.current);
      const endTime = Math.max(time, lastTimeUpdate.current);
      const rangeEvents = findTriggerEventsWithinTimeRange(
        triggerTree,
        startTime,
        endTime
      );

      for (const event of rangeEvents) {
        events.emit(event.event, { padId: event.padId });
      }

      lastTimeUpdate.current = time;
    },
    [bpm, events, pixelsPerBeat, setPlayHeadPosition, triggerTree]
  );

  useEffect(() => {
    events.on('seq:time-update', handleTimeUpdate);
    return () => {
      events.off('seq:time-update', handleTimeUpdate);
    };
  }, [events, handleTimeUpdate]);

  return events;
};
