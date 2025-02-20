import { createContext } from 'react';

import { StepSequencerPattern } from '@model/types';

export interface StepSequencerContextType {
  isPlaying: boolean;
  isRecording: boolean;
  bpm: number;
  activeStep: number;
  play: () => void;
  playToggle: () => void;
  stop: () => void;
  record: () => void;
  rewind: () => void;
  toggleStep: (padId: string, step: number) => void;
  clearEvents: () => void;
  setBpm: (bpm: number) => void;
  pattern: StepSequencerPattern;
  patternStr: string;
  patternIndex: number;
  patternCount: number;
  stepToPadIds: string[][][];
  setPatternIndex: (index: number) => void;
  deletePattern: () => void;
  addPattern: () => void;
  copyPatternToClipboard: () => Promise<void>;
  cutPatternToClipboard: () => Promise<void>;
  pastePatternFromClipboard: () => Promise<void>;
}

export const StepSequencerContext = createContext<StepSequencerContextType>({
  isPlaying: false,
  isRecording: false,
  bpm: 60,
  activeStep: -1,
  play: () => {},
  playToggle: () => {},
  stop: () => {},
  record: () => {},
  rewind: () => {},
  toggleStep: () => {},
  clearEvents: () => {},
  setBpm: () => {},
  pattern: {},
  patternStr: '',
  patternIndex: 0,
  patternCount: 0,
  stepToPadIds: [],
  setPatternIndex: () => {},
  deletePattern: () => {},
  addPattern: () => {},
  copyPatternToClipboard: () => Promise.resolve(),
  cutPatternToClipboard: () => Promise.resolve(),
  pastePatternFromClipboard: () => Promise.resolve()
});
