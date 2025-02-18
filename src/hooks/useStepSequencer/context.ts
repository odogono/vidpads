import { createContext } from 'react';

import { StepSequencerEvents } from '@model/types';

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
  pattern: StepSequencerEvents;
  patternStr: string;
  patternIndex: number;
  patternCount: number;
  stepToPadIds: string[][];
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
  stepToPadIds: []
});
