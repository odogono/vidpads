'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Circle, Play, Rewind, Square, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { OpButton } from '@components/buttons/OpButton';
import { OpTimeInput, OpTimeInputRef } from '@components/buttons/OpTimeInput';
import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { useSequencer } from '@model/hooks/useSequencer';
import { useShowMode } from '@model/hooks/useShowMode';

const log = createLog('SequencerPane');

export const SequencerPane = () => {
  const events = useEvents();
  const { setShowMode } = useShowMode();
  const [showRewind, setShowRewind] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const durationRef = useRef<OpTimeInputRef | null>(null);
  const timeRef = useRef<OpTimeInputRef | null>(null);
  const [hasSelectedEvents, setHasSelectedEvents] = useState(false);

  const {
    play,
    record,
    stop,
    rewind,
    clearEvents,
    time,
    endTime,
    setTime,
    setEndTime,
    seqSelectedEvents,
    seqSelectedEventIds,
    setSelectedEventsTime,
    setSelectedEventsDuration
  } = useSequencer();

  const handleStop = useCallback(() => {
    if (showRewind) {
      rewind();
    } else {
      stop();
    }
  }, [showRewind, rewind, stop]);

  const handlePlayStarted = useCallback(() => {
    setIsPlaying(true);
    setIsRecording(false);
    setShowRewind(false);
  }, [setIsPlaying, setIsRecording, setShowRewind]);

  const handleStopped = useCallback(
    (event: { time: number }) => {
      setIsPlaying(false);
      setIsRecording(false);
      setShowRewind(event.time > 0);
    },
    [setIsPlaying, setIsRecording, setShowRewind]
  );

  const handleTimeUpdate = useCallback(
    (event: { time: number; isPlaying: boolean; isRecording: boolean }) => {
      const { time, isPlaying, isRecording } = event;
      if (!isPlaying && !isRecording) {
        setShowRewind(time > 0);
      }
      if (!hasSelectedEvents) {
        timeRef.current?.setValue(time);
      }
    },
    [setShowRewind, hasSelectedEvents]
  );

  const handleClear = useCallback(() => {
    clearEvents();
    toast.success('Sequencer events cleared');
  }, [clearEvents]);

  useEffect(() => {
    setShowMode('sequencer');
    events.on('seq:play-started', handlePlayStarted);
    events.on('seq:stopped', handleStopped);
    events.on('seq:time-update', handleTimeUpdate);

    return () => {
      setShowMode('pads');
      events.off('seq:play-started', handlePlayStarted);
      events.off('seq:stopped', handleStopped);
      events.off('seq:time-update', handleTimeUpdate);
    };
  }, [events, handlePlayStarted, handleStopped, handleTimeUpdate, setShowMode]);

  const handleTimeChange = useCallback(
    (value: number) => {
      if (hasSelectedEvents) {
        setSelectedEventsTime(Math.max(0, value));
      } else {
        setTime(Math.max(0, value));
        log.debug('handleTimeChange setting seq time', { value });
        // events.emit('seq:set-time', { time: value });
      }
    },
    [setSelectedEventsTime, hasSelectedEvents, setTime]
  );

  const handleDurationChange = useCallback(
    (value: number) => {
      if (hasSelectedEvents) {
        setSelectedEventsDuration(Math.max(0.1, value));
      } else {
        setEndTime(Math.max(5, value));
      }
    },
    [setSelectedEventsDuration, hasSelectedEvents, setEndTime]
  );

  useEffect(() => {
    if (seqSelectedEventIds.length === 0) {
      log.debug('useEffect setting to no events', { time, endTime });
      timeRef.current?.setValue(time);
      durationRef.current?.setValue(endTime);
      setHasSelectedEvents(false);
    } else {
      const time = seqSelectedEvents.reduce((acc, event) => {
        return Math.min(acc, event.time);
      }, Number.MAX_VALUE);

      timeRef.current?.setValue(time === Number.MAX_VALUE ? 0 : time);

      const duration = seqSelectedEvents.reduce((acc, event) => {
        return Math.max(acc, event.duration);
      }, 0);
      durationRef.current?.setValue(duration);
      setHasSelectedEvents(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seqSelectedEventIds, durationRef]);

  return (
    <>
      <div className='pane-interval w-full h-full pl-2  flex flex-row gap-2  '>
        <OpButton label='Stop' onPress={handleStop}>
          {showRewind ? <Rewind /> : <Square />}
        </OpButton>
        <OpButton label='Play' onPress={play}>
          <Play className={isPlaying ? 'animate-pulse' : ''} />
        </OpButton>
        <OpButton label='Record' onPress={record}>
          <Circle
            color='var(--c3)'
            className={isRecording ? 'animate-pulse' : ''}
          />
        </OpButton>
        <OpButton label='Clear' onPress={handleClear}>
          <Trash />
        </OpButton>

        <OpTimeInput
          ref={timeRef}
          label='Time'
          isEnabled={true}
          initialValue={0}
          defaultValue={0}
          range={[0, 100]}
          description='Time'
          showIncrementButtons={true}
          onChange={handleTimeChange}
        />
        <OpTimeInput
          ref={durationRef}
          label='Duration'
          isEnabled={true}
          initialValue={0}
          defaultValue={0}
          range={[0, 100]}
          description='Duration'
          showIncrementButtons={true}
          onChange={handleDurationChange}
        />
      </div>
    </>
  );
};
