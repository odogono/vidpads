'use client';

import { useCallback, useEffect, useRef } from 'react';

import { Play, Square, Trash } from 'lucide-react';

import { OpButton } from '@components/common/OpButton';
import {
  OpIntegerInput,
  OpIntegerInputRef
} from '@components/common/OpIntegerInput';
import { OpTimeInput, OpTimeInputRef } from '@components/common/OpTimeInput';
// import { createLog } from '@helpers/log';
import { showSuccess } from '@helpers/toast';
import { useStepSequencer } from '@hooks/useStepSequencer';
import { useShowMode } from '@model/hooks/useShowMode';

// const log = createLog('StepSequencerPane', ['debug']);

export const StepSequencerPane = () => {
  const { setShowMode } = useShowMode();
  const bpmRef = useRef<OpIntegerInputRef | null>(null);
  const timeRef = useRef<OpTimeInputRef | null>(null);

  const { isPlaying, play, stop, activeStep, bpm, clearEvents, setBpm } =
    useStepSequencer();

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

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

    return () => {
      setShowMode('pads');
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
        <OpButton label={'Stop'} onPress={handleStop} isEnabled={isPlaying}>
          <Square />
        </OpButton>
        <OpButton label='Play' onPress={play}>
          <Play className={isPlaying ? 'animate-pulse' : ''} />
        </OpButton>
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
