'use client';

import { useCallback, useEffect, useRef } from 'react';

import {
  ClipboardCopy,
  ClipboardPaste,
  ClipboardX,
  Play,
  Plus,
  Square,
  Trash
} from 'lucide-react';

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
import { OpBiButton } from '../common/OpBiButton';
import { OpNumberSelect } from '../common/OpNumberSelect';

// const log = createLog('StepSequencerPane', ['debug']);

export const StepSequencerPane = () => {
  const { setShowMode } = useShowMode();
  const bpmRef = useRef<OpIntegerInputRef | null>(null);
  const timeRef = useRef<OpTimeInputRef | null>(null);

  const {
    isPlaying,
    play,
    stop,
    activeStep,
    bpm,
    clearEvents,
    setBpm,
    patternIndex,
    patternCount,
    setPatternIndex,
    addPattern,
    copyPatternToClipboard,
    cutPatternToClipboard,
    pastePatternFromClipboard
  } = useStepSequencer();

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  useEffect(() => {
    const timeValue = patternIndex + 1 + (activeStep + 1) / 1000;
    timeRef.current?.setValue(timeValue);
  }, [activeStep, patternIndex]);

  useEffect(() => {
    bpmRef.current?.setValue(bpm);
  }, [bpm]);

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

        <div className='ml-6 flex flex-col items-center gap-2 mb-4 '>
          <OpIntegerInput
            ref={bpmRef}
            label='BPM'
            labelPlacement='right'
            isEnabled={true}
            initialValue={bpm}
            defaultValue={bpm}
            range={[20, 200]}
            description='BPM'
            showIncrementButtons={true}
            onChange={handleBpmChange}
          />
          <OpTimeInput
            ref={timeRef}
            label='Time'
            labelPlacement='right'
            isEnabled={false}
            initialValue={0}
            defaultValue={0}
            range={[0, 100]}
            description='Time'
            showIncrementButtons={true}
          />
        </div>
        <div className='flex flex-row gap-2 ml-6'>
          <OpNumberSelect
            label='Pattern'
            isEnabled={true}
            value={patternIndex}
            valueMax={patternCount}
          />
          <OpBiButton
            label='Pattern'
            size='sm'
            isEnabled={!isPlaying}
            onPressUp={() => setPatternIndex(patternIndex - 1)}
            onPressDown={() => setPatternIndex(patternIndex + 1)}
          />
          <OpButton
            label='Add'
            onPress={() => addPattern()}
            isEnabled={!isPlaying}
          >
            <Plus />
          </OpButton>
          <OpButton
            label='Cut'
            onPress={() => cutPatternToClipboard()}
            isEnabled={!isPlaying}
          >
            <ClipboardX />
          </OpButton>
          <OpButton
            label='Copy'
            onPress={() => copyPatternToClipboard()}
            isEnabled={!isPlaying}
          >
            <ClipboardCopy />
          </OpButton>
          <OpButton
            label='Paste'
            onPress={() => pastePatternFromClipboard()}
            isEnabled={!isPlaying}
          >
            <ClipboardPaste />
          </OpButton>
        </div>
      </div>
    </>
  );
};
