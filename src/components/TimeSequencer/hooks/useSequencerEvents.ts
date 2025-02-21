'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { secondsToPixels } from '@helpers/time';
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

const log = createLog('seq/useSequencerEvents', ['debug']);

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
    log.debug('handleStopped');
  }, [setIsRecording]);

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
