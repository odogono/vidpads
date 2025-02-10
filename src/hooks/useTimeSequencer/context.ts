'use client';

import { createContext } from 'react';

import { SequencerEvent } from '@model/types';

export type TimeSequencerContextType = {
  isPlaying: boolean;
  isRecording: boolean;
  isLooped: boolean;
  time: number;
  endTime: number;
  play: () => void;
  playToggle: () => void;
  stop: () => void;
  record: () => void;
  rewind: () => void;
  setEndTime: (endTime: number) => void;
  setTime: (time: number) => void;
  setLooped: (isLooped: boolean) => void;
  bpm: number;
  timeToStep: (time: number) => number;
  stepToTime: (step: number) => number;
  seqEvents: SequencerEvent[];
  seqSelectedEvents: SequencerEvent[];
  seqSelectedEventIds: string;
  seqEventIds: string;
  getEventsAtTime: (padId: string, time: number) => SequencerEvent[];

  toggleEvent: (padId: string, startTime: number, endTime: number) => void;
  clearEvents: () => void;
  addEvent: (padId: string, time: number, duration: number) => void;
  removeEvent: (padId: string, time: number) => void;
  selectEvents: (events: SequencerEvent[]) => void;
  repeatEvents: () => void;
  cutEvents: () => void;
  snapEvents: () => void;
  selectEventsAtTime: (
    padIds: string[],
    time: number,
    duration: number
  ) => void;
  moveEvents: (
    timeDelta: number,
    rowDelta: number,
    isFinished?: boolean
  ) => void;
  setSelectedEventsTime: (time: number) => void;
  setSelectedEventsDuration: (duration: number) => void;
};

export const TimeSequencerContext = createContext<TimeSequencerContextType>({
  isPlaying: false,
  isRecording: false,
  isLooped: false,
  time: 0,
  endTime: 0,
  play: () => {},
  playToggle: () => {},
  stop: () => {},
  record: () => {},
  rewind: () => {},
  setEndTime: () => {},
  setTime: () => {},
  setLooped: () => {},
  bpm: 0,
  seqEvents: [],
  seqSelectedEvents: [],
  seqSelectedEventIds: '',
  seqEventIds: '',
  getEventsAtTime: () => [],
  timeToStep: () => 0,
  stepToTime: () => 0,
  toggleEvent: () => {},
  clearEvents: () => {},
  addEvent: () => {},
  removeEvent: () => {},
  selectEvents: () => {},
  selectEventsAtTime: () => {},
  moveEvents: () => {},
  setSelectedEventsTime: () => {},
  setSelectedEventsDuration: () => {},
  repeatEvents: () => {},
  cutEvents: () => {},
  snapEvents: () => {}
});
