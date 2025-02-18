import { createContext } from 'react';

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
  rewind: () => {}
});
