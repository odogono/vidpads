'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Circle, Play, Repeat2, Rewind, Square, Trash } from 'lucide-react';

import { OpButton } from '@/components/common/OpButton';
import { OpTimeInput, OpTimeInputRef } from '@/components/common/OpTimeInput';
import { OpToggleButton } from '@/components/common/OpToggleButton';
import { createLog } from '@helpers/log';
import { showSuccess } from '@helpers/toast';
import { useTimeSequencer } from '@hooks/useTimeSequencer';
import { useShowMode } from '@model/hooks/useShowMode';
import { usePlayHeadUpdate } from './hooks/usePlayHeadUpdate';

const log = createLog('SequencerPane', ['debug']);

export const SequencerPane = () => {
  const { setShowMode } = useShowMode();
  const [showRewind, setShowRewind] = useState(false);
  const durationRef = useRef<OpTimeInputRef | null>(null);
  const [hasSelectedEvents, setHasSelectedEvents] = useState(false);

  const { timeRef } = usePlayHeadUpdate({ hasSelectedEvents });

  const {
    isPlaying,
    isRecording,
    isLooped,
    play,
    record,
    stop,
    rewind,
    clearEvents,
    time,
    endTime,
    setTime,
    setEndTime,
    setLooped,
    seqSelectedEvents,
    seqSelectedEventIds,
    setSelectedEventsTime,
    setSelectedEventsDuration
  } = useTimeSequencer();

  const handleStop = useCallback(() => {
    if (showRewind) {
      rewind();
    } else {
      stop();
    }
  }, [showRewind, rewind, stop]);

  const handleLoop = useCallback(() => {
    setLooped(!isLooped);
  }, [isLooped, setLooped]);

  useEffect(() => {
    setShowRewind(!isPlaying && !isRecording && time > 0);
  }, [isPlaying, isRecording, time]);

  useEffect(() => {
    timeRef.current?.setValue(time);
    durationRef.current?.setValue(endTime);
  }, [time, endTime, timeRef]);

  const handleClear = useCallback(() => {
    clearEvents();
    showSuccess('Sequencer events cleared');
  }, [clearEvents]);

  useEffect(() => {
    setShowMode('sequencer');

    return () => {
      setShowMode('pads');
    };
  }, [setShowMode]);

  const handleTimeChange = useCallback(
    (value: number) => {
      if (hasSelectedEvents) {
        setSelectedEventsTime(Math.max(0, value));
      } else {
        setTime(Math.max(0, value));
        log.debug('handleTimeChange setting seq time', { value });
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
      <div className='vo-pane-sequencer w-fit h-full pl-2  flex flex-row gap-2 items-center justify-center '>
        <OpButton label={showRewind ? 'Rewind' : 'Stop'} onPress={handleStop}>
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

        <div className='ml-6 flex flex-col items-end gap-1'>
          <OpTimeInput
            ref={timeRef}
            label='Time'
            labelPlacement='left'
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
            labelPlacement='left'
            isEnabled={true}
            initialValue={0}
            defaultValue={0}
            range={[0, 100]}
            description='Duration'
            showIncrementButtons={true}
            onChange={handleDurationChange}
          />
        </div>
        <div className='flex flex-row gap-2 ml-4'>
          <OpToggleButton
            label='Loop'
            isSelected={isLooped}
            onPress={handleLoop}
          >
            <Repeat2 />
          </OpToggleButton>
          <OpButton label='Clear' onPress={handleClear}>
            <Trash />
          </OpButton>
        </div>
      </div>
    </>
  );
};
