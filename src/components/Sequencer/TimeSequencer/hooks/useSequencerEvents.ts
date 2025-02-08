'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { useTimeSequencer } from '@hooks/useTimeSequencer';
import { createSequencerEvent } from '@model/sequencerEvent';
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
  seqEvents: SequencerEvent[];
  seqEventIds: string;
}

// const log = createLog('seq/useSequencerEvents');

export const useSequencerEvents = ({
  setPlayHeadPosition,
  pixelsPerBeat,
  bpm,
  canvasBpm,
  seqEvents,
  seqEventIds
}: UseSequencerEventsProps) => {
  const events = useEvents();
  const lastTimeUpdate = useRef(0);
  const [isRecording, setIsRecording] = useState(false);
  const { addEvent } = useTimeSequencer();
  const recordEvents = useRef<Map<string, SequencerEvent>>(new Map());

  const handlePadTouchdown = useCallback(
    (event: { padId: string }) => {
      if (!isRecording) return;
      const { padId } = event;
      // log.debug('pad:touchdown', padId);

      const seqEvent = createSequencerEvent({
        padId,
        time: lastTimeUpdate.current,
        duration: 0.5
      });

      recordEvents.current.set(padId, seqEvent);
    },
    [recordEvents, lastTimeUpdate, isRecording]
  );

  const handlePadTouchup = useCallback(
    (event: { padId: string }) => {
      if (!isRecording) return;
      const { padId } = event;
      // log.debug('pad:touchup', padId);
      const seqEvent = recordEvents.current.get(padId);
      if (!seqEvent) return;
      recordEvents.current.delete(padId);

      seqEvent.duration = lastTimeUpdate.current - seqEvent.time;

      addEvent(seqEvent.padId, seqEvent.time, seqEvent.duration);
    },
    [addEvent, recordEvents, lastTimeUpdate, isRecording]
  );

  const handleRecordStarted = useCallback(() => {
    setIsRecording(true);
    recordEvents.current.clear();
  }, [setIsRecording, recordEvents]);

  const handleStopped = useCallback(() => {
    setIsRecording(false);
  }, [setIsRecording]);

  // creates a binary tree of trigger events
  const triggerTree: TriggerNode | undefined = useMemo(() => {
    const result = seqEvents.reduce(
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
  }, [seqEventIds, pixelsPerBeat, canvasBpm, bpm]);

  const handleTimeUpdate = useCallback(
    (event: { time: number; isPlaying: boolean; isRecording: boolean }) => {
      const { time, isPlaying, isRecording } = event;
      const playHeadPosition = secondsToPixels(time, pixelsPerBeat, bpm);
      setPlayHeadPosition(playHeadPosition);

      if (!isPlaying && !isRecording) {
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
        events.emit(event.event, { padId: event.padId, source: 'sequencer' });
      }

      lastTimeUpdate.current = time;
    },
    [bpm, events, pixelsPerBeat, setPlayHeadPosition, triggerTree]
  );

  useEffect(() => {
    events.on('pad:touchdown', handlePadTouchdown);
    events.on('pad:touchup', handlePadTouchup);
    events.on('seq:time-update', handleTimeUpdate);
    events.on('seq:record-started', handleRecordStarted);
    events.on('seq:stopped', handleStopped);
    return () => {
      events.off('pad:touchdown', handlePadTouchdown);
      events.off('pad:touchup', handlePadTouchup);
      events.off('seq:time-update', handleTimeUpdate);
      events.off('seq:record-started', handleRecordStarted);
      events.off('seq:stopped', handleStopped);
    };
  }, [
    events,
    handlePadTouchdown,
    handlePadTouchup,
    handleTimeUpdate,
    handleRecordStarted,
    handleStopped
  ]);

  return events;
};
