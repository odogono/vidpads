'use client';

import { useCallback, useEffect, useRef } from 'react';

import {
  ClipboardCopy,
  ClipboardPaste,
  ClipboardX,
  Play,
  Plus,
  Square
} from 'lucide-react';

import { OpButton } from '@components/common/OpButton';
import {
  OpIntegerInput,
  OpIntegerInputRef
} from '@components/common/OpIntegerInput';
import { OpNumberSelect } from '@components/common/OpNumberSelect';
import { OpTimeInput, OpTimeInputRef } from '@components/common/OpTimeInput';
import { useStepSequencer } from '@hooks/useStepSequencer';
import { useEvents } from './hooks/useEvents';

export const StepSequencerPane = () => {
  const bpmDisplayRef = useRef<OpIntegerInputRef | null>(null);
  const patternDisplayRef = useRef<OpTimeInputRef | null>(null);

  const {
    isPlaying,
    play,
    stop,
    activeStep,
    bpm,
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

  const setPatternDisplay = useCallback((pattern: number, step: number = 0) => {
    const timeValue = pattern + 1 + (step + 1) / 1000;
    patternDisplayRef.current?.setValue(timeValue);
  }, []);

  useEffect(() => {
    setPatternDisplay(patternIndex, activeStep);
  }, [activeStep, patternIndex, setPatternDisplay]);

  // set the bpm from state
  useEffect(() => bpmDisplayRef.current?.setValue(bpm), [bpm]);

  // set the bpm from the input
  const handleBpmChange = useCallback(
    (value: number) => setBpm(value),
    [setBpm]
  );

  const { timeRef } = useEvents({ isPlaying, patternIndex, setPatternDisplay });

  return (
    <>
      <div className='vo-pane-sequencer w-fit h-full pl-2 flex flex-row gap-2 items-center justify-center overflow-x-none'>
        <OpButton label={'Stop'} onPress={handleStop} isEnabled={isPlaying}>
          <Square />
        </OpButton>
        <OpButton label='Play' onPress={play}>
          <Play className={isPlaying ? 'animate-pulse' : ''} />
        </OpButton>

        <div className='ml-6 flex flex-col items-end gap-1 '>
          <OpIntegerInput
            ref={bpmDisplayRef}
            label='BPM'
            labelPlacement='left'
            isEnabled={true}
            initialValue={bpm}
            defaultValue={bpm}
            range={[1, 200]}
            description='BPM'
            showIncrementButtons={true}
            onChange={handleBpmChange}
          />
          <OpTimeInput
            ref={patternDisplayRef}
            label='Pattern'
            labelPlacement='left'
            isEnabled={false}
            initialValue={0}
            defaultValue={0}
            range={[0, 100]}
            description='Time'
            showIncrementButtons={true}
          />
          <OpTimeInput
            ref={timeRef}
            label='Time'
            labelPlacement='left'
            isEnabled={false}
            initialValue={0}
            defaultValue={0}
            range={[0, 100]}
            description='Time'
            showIncrementButtons={true}
          />
        </div>
        <div className='flex flex-row gap-2 ml-4'>
          <OpNumberSelect
            label='Pattern'
            isEnabled={!isPlaying}
            value={patternIndex}
            valueMax={patternCount}
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
