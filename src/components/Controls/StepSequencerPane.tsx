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
// import { createLog } from '@helpers/log';
// import { showSuccess } from '@helpers/toast';
import { useEvents } from '@hooks/events';
import { PadInteractionEvent } from '@hooks/events/types';
import { useStepSequencer } from '@hooks/useStepSequencer';
import { useShowMode } from '@model/hooks/useShowMode';

// const log = createLog('StepSequencerPane', ['debug']);

export const StepSequencerPane = () => {
  const events = useEvents();
  const { setShowMode } = useShowMode();
  const bpmRef = useRef<OpIntegerInputRef | null>(null);
  const timeRef = useRef<OpTimeInputRef | null>(null);

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
    timeRef.current?.setValue(timeValue);
  }, []);

  useEffect(() => {
    setPatternDisplay(patternIndex, activeStep);
  }, [activeStep, patternIndex, setPatternDisplay]);

  // set the bpm from state
  useEffect(() => bpmRef.current?.setValue(bpm), [bpm]);

  // set the bpm from the input
  const handleBpmChange = useCallback(
    (value: number) => setBpm(value),
    [setBpm]
  );
  // const handleClear = useCallback(() => {
  //   clearEvents();
  //   showSuccess('Sequencer events cleared');
  // }, [clearEvents]);

  const handlePadEnter = useCallback(
    ({ index }: PadInteractionEvent) => {
      if (isPlaying) return;
      setPatternDisplay(patternIndex, index);
    },
    [isPlaying, patternIndex, setPatternDisplay]
  );

  const handlePadLeave = useCallback(() => {
    if (isPlaying) return;
    setPatternDisplay(patternIndex, -1);
  }, [isPlaying, patternIndex, setPatternDisplay]);

  useEffect(() => {
    setShowMode('step');
    events.on('pad:enter', handlePadEnter);
    events.on('pad:leave', handlePadLeave);
    return () => {
      setShowMode('pads');
      events.off('pad:enter', handlePadEnter);
      events.off('pad:leave', handlePadLeave);
    };
  }, [setShowMode, handlePadEnter, handlePadLeave, events]);

  return (
    <>
      <div className='vo-pane-sequencer w-fit h-full pl-2  flex flex-row gap-2 items-center justify-center overflow-x-none'>
        <OpButton label={'Stop'} onPress={handleStop} isEnabled={isPlaying}>
          <Square />
        </OpButton>
        <OpButton label='Play' onPress={play}>
          <Play className={isPlaying ? 'animate-pulse' : ''} />
        </OpButton>

        <div className='ml-6 flex flex-col items-center gap-2 mb-4 '>
          <OpIntegerInput
            ref={bpmRef}
            label='BPM'
            labelPlacement='right'
            isEnabled={true}
            initialValue={bpm}
            defaultValue={bpm}
            range={[1, 200]}
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
