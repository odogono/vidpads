'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Play, Rewind, Square, Trash } from 'lucide-react';

import { OpButton } from '@/components/common/OpButton';
import {
  OpIntegerInput,
  OpIntegerInputRef
} from '@components/common/OpIntegerInput';
import { OpTimeInput, OpTimeInputRef } from '@components/common/OpTimeInput';
import { createLog } from '@helpers/log';
import { showSuccess } from '@helpers/toast';
import { useEvents } from '@hooks/events';
import type { SequencerTimeUpdateEvent } from '@hooks/events/types';
import { useStepSequencer } from '@hooks/useStepSequencer';
import { useShowMode } from '@model/hooks/useShowMode';

const log = createLog('StepSequencerPane', ['']);

export const StepSequencerPane = () => {
  const events = useEvents();
  const { setShowMode } = useShowMode();
  const [showRewind, setShowRewind] = useState(false);
  // const [isPlaying, setIsPlaying] = useState(false);
  // const [isRecording, setIsRecording] = useState(false);
  const bpmRef = useRef<OpIntegerInputRef | null>(null);
  const timeRef = useRef<OpTimeInputRef | undefined>(undefined);

  const {
    isPlaying,
    play,
    stop,
    rewind,
    activeStep,
    bpm,
    clearEvents,
    setBpm
  } = useStepSequencer();

  const handleStop = useCallback(() => {
    if (showRewind) {
      rewind();
    } else {
      stop();
    }
  }, [showRewind, rewind, stop]);

  // useEffect(() => {
  //   setShowRewind(!isPlaying && !isRecording && time > 0);
  // }, [isPlaying, isRecording, time]);

  // const handleTimeUpdate = useCallback((event: SequencerTimeUpdateEvent) => {
  //   const { time } = event;
  //   // log.debug('handleTimeUpdate', { time, isStep });

  //   timeRef.current?.setValue(time);
  // }, []);

  useEffect(() => {
    timeRef.current?.setValue(activeStep === -1 ? undefined : activeStep + 1);
    bpmRef.current?.setValue(bpm);
  }, [bpm, activeStep]);

  const handleClear = useCallback(() => {
    clearEvents();
    showSuccess('Sequencer events cleared');
  }, [clearEvents]);

  useEffect(() => {
    setShowMode('step');
    // events.on('seq:time-update', handleTimeUpdate);

    return () => {
      setShowMode('pads');
      // events.off('seq:time-update', handleTimeUpdate);
    };
  }, [setShowMode]);

  const handleBpmChange = useCallback(
    (value: number) => {
      setBpm(value);
    },
    [setBpm]
  );

  return (
    <>
      <div className='vo-pane-sequencer w-fit h-full pl-2  flex flex-row gap-2 items-center justify-center '>
        <OpButton label={showRewind ? 'Rewind' : 'Stop'} onPress={handleStop}>
          {showRewind ? <Rewind /> : <Square />}
        </OpButton>
        <OpButton label='Play' onPress={play}>
          <Play className={isPlaying ? 'animate-pulse' : ''} />
        </OpButton>
        {/* <OpButton label='Record' onPress={record}>
          <Circle
            color='var(--c3)'
            className={isRecording ? 'animate-pulse' : ''}
          />
        </OpButton> */}
        {/* <OpToggleButton label='Loop' isSelected={isLooped} onPress={handleLoop}>
          <Repeat2 />
        </OpToggleButton> */}
        <OpButton label='Clear' onPress={handleClear}>
          <Trash />
        </OpButton>

        <div className='ml-6 flex flex-row gap-2'>
          <OpTimeInput
            ref={timeRef}
            label='Time'
            isEnabled={false}
            initialValue={0}
            defaultValue={0}
            range={[0, 100]}
            description='Time'
            showIncrementButtons={true}
          />
          <OpIntegerInput
            ref={bpmRef}
            label='BPM'
            isEnabled={true}
            initialValue={bpm}
            defaultValue={bpm}
            range={[20, 200]}
            description='BPM'
            showIncrementButtons={true}
            onChange={handleBpmChange}
          />
        </div>
      </div>
    </>
  );
};
