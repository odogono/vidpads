'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { secondsToPixels } from '@helpers/time';
// import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { SequencerPlayHeadUpdateEvent } from '@hooks/events/types';
import { useTimeSequencer } from '@hooks/useTimeSequencer';
import { createSequencerEvent } from '@model/sequencerEvent';
import { SequencerEvent } from '@model/types';

interface UseSequencerEventsProps {
  pixelsPerBeat: number;
  bpm: number;
  time: number;
}

// const log = createLog('seq/useSequencerEvents');

export const useSequencerEvents = ({
  pixelsPerBeat,
  bpm,
  time
}: UseSequencerEventsProps) => {
  const events = useEvents();
  const lastTimeUpdate = useRef(0);
  const [isRecording, setIsRecording] = useState(false);
  const { addEvent } = useTimeSequencer();
  const recordEvents = useRef<Map<string, SequencerEvent>>(new Map());

  const [playHeadPosition, setPlayHeadPosition] = useState(
    secondsToPixels(time, pixelsPerBeat, bpm)
  );

  const handlePadTouchdown = useCallback(
    (event: { padId: string }) => {
      if (!isRecording) return;
      const { padId } = event;
      // log.debug('pad:touchdown', padId);

      const seqEvent = createSequencerEvent({
        padId,
        time: lastTimeUpdate.current,
        duration: 0.01,
        // this flag means that the event component
        // will update its width as the playhead moves
        inProgress: true
      });

      addEvent(seqEvent);

      recordEvents.current.set(padId, seqEvent);
    },
    [recordEvents, lastTimeUpdate, isRecording, addEvent]
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
      seqEvent.inProgress = false;

      addEvent(seqEvent);
    },
    [addEvent, recordEvents, lastTimeUpdate, isRecording]
  );

  const handleRecordStarted = useCallback(() => {
    setIsRecording(true);
    recordEvents.current.clear();
  }, [setIsRecording, recordEvents]);

  const handleStopped = useCallback(() => {
    setIsRecording(false);
    // stop all players
    events.emit('video:stop', {
      url: '',
      padId: '',
      all: true,
      time: 0,
      requestId: 'sequencer-stopped'
    });
  }, [setIsRecording, events]);

  // // creates a binary tree of trigger events
  // const triggerTree: TriggerNode | undefined = useMemo(() => {
  //   const result = seqEvents.reduce(
  //     (tree, e) => {
  //       if (!e) return tree;
  //       const { time, duration, padId, inProgress } = e;

  //       if (inProgress) return tree;

  //       const adjTime = pixelsToMs(
  //         msToPixels(time, pixelsPerBeat, canvasBpm),
  //         pixelsPerBeat,
  //         bpm
  //       );
  //       const adjDuration = pixelsToMs(
  //         msToPixels(duration, pixelsPerBeat, canvasBpm),
  //         pixelsPerBeat,
  //         bpm
  //       );

  //       tree = insertTriggerEvent(tree, {
  //         event: 'pad:touchdown',
  //         time: adjTime,
  //         padId
  //       });
  //       tree = insertTriggerEvent(tree, {
  //         event: 'pad:touchup',
  //         time: adjTime + adjDuration,
  //         padId
  //       });
  //       return tree;
  //     },
  //     undefined as TriggerNode | undefined
  //   );

  //   return result;
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [seqEventIds, pixelsPerBeat, canvasBpm, bpm]);

  // const handleTimeUpdate = useCallback(
  //   (event: SequencerTimeUpdateEvent) => {
  //     const { time, isPlaying, isRecording, mode } = event;
  //     if (mode !== 'time') return;

  //     // applyTimeUpdate(
  //     //   time,
  //     //   isPlaying,
  //     //   isRecording,
  //     //   lastTimeUpdate,
  //     //   events,
  //     //   triggerTree
  //     // );
  //     // const playHeadPosition = secondsToPixels(time, pixelsPerBeat, bpm);
  //     // setPlayHeadPosition(playHeadPosition);

  //     // if (!isPlaying && !isRecording) {
  //     //   lastTimeUpdate.current = time;
  //     //   return;
  //     // }

  //     // // emit an update event so that any events which
  //     // // are being recorded can update their dimensions
  //     // events.emit('seq:playhead-update', {
  //     //   time,
  //     //   playHeadX: playHeadPosition,
  //     //   isPlaying,
  //     //   isRecording
  //     // });

  //     // // get all of the events between the last time this was called
  //     // // and the current time
  //     // const startTime = Math.min(time, lastTimeUpdate.current);
  //     // const endTime = Math.max(time, lastTimeUpdate.current);
  //     // const rangeEvents = findTriggerEventsWithinTimeRange(
  //     //   triggerTree,
  //     //   startTime,
  //     //   endTime
  //     // );

  //     // // console.debug(
  //     // //   '[handleTimeUpdate] rangeEvents',
  //     // //   { time, startTime, endTime, tree: triggerTreeToEvents(triggerTree) },
  //     // //   rangeEvents.length
  //     // // );

  //     // for (const event of rangeEvents) {
  //     //   events.emit(event.event, {
  //     //     padId: event.padId,
  //     //     source: 'sequencer',
  //     //     forceStop: true,
  //     //     requestId: 'sequencer-time-update'
  //     //   });
  //     // }

  //     // lastTimeUpdate.current = time;
  //   },
  //   []
  // );

  const handlePlayHeadUpdate = useCallback(
    ({ playHeadX }: SequencerPlayHeadUpdateEvent) => {
      setPlayHeadPosition(playHeadX);
    },
    [setPlayHeadPosition]
  );

  useEffect(() => {
    events.on('pad:touchdown', handlePadTouchdown);
    events.on('pad:touchup', handlePadTouchup);
    events.on('seq:playhead-update', handlePlayHeadUpdate);
    events.on('seq:record-started', handleRecordStarted);
    events.on('seq:stopped', handleStopped);
    events.on('cmd:cancel', handleStopped);
    return () => {
      events.off('pad:touchdown', handlePadTouchdown);
      events.off('pad:touchup', handlePadTouchup);
      events.off('seq:playhead-update', handlePlayHeadUpdate);
      events.off('seq:record-started', handleRecordStarted);
      events.off('seq:stopped', handleStopped);
      events.off('cmd:cancel', handleStopped);
    };
  }, [
    events,
    handlePadTouchdown,
    handlePadTouchup,
    handlePlayHeadUpdate,
    handleRecordStarted,
    handleStopped
  ]);

  return { playHeadPosition };
};

// const applyTimeUpdate = (
//   time: number,
//   isPlaying: boolean,
//   isRecording: boolean,
//   lastTimeUpdate: RefObject<number>,
//   events: EventEmitter,
//   triggerTree: TriggerNode | undefined
// ) => {
//   // const playHeadPosition = secondsToPixels(time, pixelsPerBeat, bpm);
//   // setPlayHeadPosition(playHeadPosition);

//   if (!isPlaying && !isRecording) {
//     lastTimeUpdate.current = time;
//     return;
//   }

//   // // emit an update event so that any events which
//   // // are being recorded can update their dimensions
//   // events.emit('seq:playhead-update', {
//   //   time,
//   //   playHeadX: playHeadPosition,
//   //   isPlaying,
//   //   isRecording
//   // });

//   // get all of the events between the last time this was called
//   // and the current time
//   const startTime = Math.min(time, lastTimeUpdate.current);
//   const endTime = Math.max(time, lastTimeUpdate.current);
//   const rangeEvents = findTriggerEventsWithinTimeRange(
//     triggerTree,
//     startTime,
//     endTime
//   );

//   // console.debug(
//   //   '[handleTimeUpdate] rangeEvents',
//   //   { time, startTime, endTime, tree: triggerTreeToEvents(triggerTree) },
//   //   rangeEvents.length
//   // );

//   for (const event of rangeEvents) {
//     events.emit(event.event, {
//       padId: event.padId,
//       source: 'sequencer',
//       forceStop: true,
//       requestId: 'sequencer-time-update'
//     });
//   }

//   lastTimeUpdate.current = time;
// };
