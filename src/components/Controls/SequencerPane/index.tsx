'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Circle, Play, Rewind, Square, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { OpButton } from '@components/buttons/OpButton';
import { OpInput } from '@components/buttons/OpInput';
import { useEvents } from '@helpers/events';
import { useKeyboard } from '@helpers/keyboard/useKeyboard';
import { createLog } from '@helpers/log';
import { useSequencer } from '@model/hooks/useSequencer';
import { useShowMode } from '@model/hooks/useShowMode';
import { OpTimeInput, OpTimeInputRef } from '../../buttons/OpTimeInput';

const log = createLog('SequencerPane');

export const SequencerPane = () => {
  const events = useEvents();
  const { setShowMode } = useShowMode();
  const [showRewind, setShowRewind] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const durationRef = useRef<OpTimeInputRef | null>(null);
  const [hasSelectedEvents, setHasSelectedEvents] = useState(false);

  const {
    bpm,
    setBpm,
    clearEvents,
    startTime,
    endTime,
    setStartTime,
    setEndTime,
    selectedEvents,
    selectedEventIds,
    setSelectedEventsDuration
  } = useSequencer();

  const handlePlay = useCallback(() => {
    events.emit('seq:play');
  }, [events]);

  const handleRecord = useCallback(() => {
    events.emit('seq:record');
  }, [events]);

  const handleStop = useCallback(() => {
    if (showRewind) {
      events.emit('seq:rewind');
    } else {
      events.emit('seq:stop', {
        time: performance.now()
      });
    }
  }, [events, showRewind]);

  const handlePlayStarted = useCallback(() => {
    setIsPlaying(true);
    setShowRewind(false);
  }, [setIsPlaying, setShowRewind]);

  const handleStopped = useCallback(
    (event: { time: number }) => {
      setIsPlaying(false);
      setShowRewind(event.time > 0);
    },
    [setIsPlaying, setShowRewind]
  );

  const handleTimeUpdate = useCallback(
    (event: { time: number }) => {
      if (!isPlaying) {
        setShowRewind(event.time > 0);
      }
    },
    [isPlaying, setShowRewind]
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

  const handleDurationChange = useCallback(
    (value: number) => {
      setSelectedEventsDuration(Math.max(0.1, value));
    },
    [setSelectedEventsDuration]
  );

  useEffect(() => {
    const duration = selectedEvents.reduce((acc, event) => {
      return Math.max(acc, event.duration);
    }, 0);
    durationRef.current?.setValue(duration);
    setHasSelectedEvents(duration > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventIds, durationRef]);

  return (
    <>
      <div className='pane-interval w-full h-full pl-2 bg-slate-500 flex flex-row gap-2  border-slate-400'>
        <OpButton label='Stop' onPress={handleStop}>
          {showRewind ? <Rewind /> : <Square />}
        </OpButton>
        <OpButton label='Play' onPress={handlePlay}>
          <Play className={isPlaying ? 'animate-pulse' : ''} />
        </OpButton>
        <OpButton label='Record' onPress={handleRecord}>
          <Circle color='#b51a00' />
        </OpButton>
        <OpButton label='Clear' onPress={handleClear}>
          <Trash />
        </OpButton>
        <OpInput
          label='Start'
          value={`${startTime}`}
          onChange={(value: string) => setStartTime(Number(value))}
        />
        <OpInput
          label='End'
          value={`${endTime}`}
          onChange={(value: string) => setEndTime(Number(value))}
        />
        <OpInput
          label='BPM'
          value={`${bpm}`}
          onChange={(value: string) => setBpm(Number(value))}
        />
        <OpTimeInput
          ref={durationRef}
          label='Duration'
          isDisabled={!hasSelectedEvents}
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
