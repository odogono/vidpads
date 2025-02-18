import { createContext } from 'react';

import { StepSequencerEvents } from '@model/types';

export interface StepSequencerContextType {
  isPlaying: boolean;
  isRecording: boolean;
  isLooped: boolean;
  time: number;
  endTime: number;
  bpm: number;
  play: () => void;
  playToggle: () => void;
  stop: () => void;
  record: () => void;
  rewind: () => void;
  toggleStep: (padId: string, step: number) => void;
  clearEvents: () => void;
  seqEvents: StepSequencerEvents;
  seqEventsStr: string;
  stepToPadIds: string[][];
}

export const StepSequencerContext = createContext<StepSequencerContextType>({
  isPlaying: false,
  isRecording: false,
  isLooped: false,
  time: 0,
  endTime: 0,
  bpm: 60,
  play: () => {},
  playToggle: () => {},
  stop: () => {},
  record: () => {},
  rewind: () => {},
  toggleStep: () => {},
  clearEvents: () => {},
  seqEvents: {},
  seqEventsStr: '',
  stepToPadIds: []
});
