'use client';

import { createLog } from '@helpers/log';
import { createStore as createXStateStore } from '@xstate/store';

const log = createLog('seq/state');

type PlayAction = {
  type: 'play';
};

type StopAction = {
  type: 'stop';
};

type RecordAction = {
  type: 'record';
};

type RewindAction = {
  type: 'rewind';
};

type SetEndTimeAction = {
  type: 'setEndTime';
  time: number;
};

type SetTimeAction = {
  type: 'setTime';
  time: number;
};

// type TimeUpdateAction = {
//   type: 'timeUpdate';
//   time: number;
// };

type Actions =
  | PlayAction
  | StopAction
  | RecordAction
  | RewindAction
  | SetEndTimeAction
  | SetTimeAction;

export type PlayStartedEvent = {
  type: 'playStarted';
  time: number;
};

export type PlayStoppedEvent = {
  type: 'playStopped';
  time: number;
};

export type RecordStartedEvent = {
  type: 'recordStarted';
  time: number;
};

export type TimeUpdateEvent = {
  type: 'timeUpdate';
  time: number;
};

export type SetElapsedTimeEvent = {
  type: 'setElapsedTime';
  time: number; // in ms
};

type SeqEmittedEvents =
  | PlayStartedEvent
  | PlayStoppedEvent
  | TimeUpdateEvent
  | RecordStartedEvent
  | SetElapsedTimeEvent;
type Emit = { emit: (event: SeqEmittedEvents) => void };

interface SeqStoreContext {
  // time in ms when the sequence started playing/recording
  playStartedAt: number;

  // current time of the sequence (only updated when stopped)
  time: number;

  // time when the sequence ends
  endTime: number;

  // time elapsed since the sequence started playing/recording
  // elapsedTime: number;

  // whether the sequence is recording
  isRecording: boolean;

  // whether the sequence is playing
  isPlaying: boolean;
}

const onHandlers = {
  play: (context: SeqStoreContext, action: PlayAction, { emit }: Emit) => {
    const { isPlaying, isRecording, time, endTime } = context;
    // log.debug('play', { isPlaying, isRecording, elapsedTime });
    if (isPlaying || isRecording) return context;
    emit({ type: 'playStarted', time });
    log.debug('play', { time, endTime });
    return {
      ...context,
      playStartedAt: performance.now(),
      isPlaying: true
    };
  },
  stop: (context: SeqStoreContext, action: StopAction, { emit }: Emit) => {
    const { time, playStartedAt } = context;
    const newTime = time + (performance.now() - playStartedAt);
    emit({ type: 'playStopped', time: newTime });
    emit({ type: 'timeUpdate', time: newTime });
    log.debug('stop', {
      time,
      newTime,
      playStartedAt
    });
    return {
      ...context,
      isPlaying: false,
      isRecording: false,
      time: newTime
    };
  },
  record: (context: SeqStoreContext, action: RecordAction, { emit }: Emit) => {
    const { isPlaying, isRecording, time } = context;
    if (isPlaying || isRecording) return context;
    const now = performance.now();
    emit({ type: 'recordStarted', time });
    return {
      ...context,
      playStartedAt: now,
      isPlaying: false,
      isRecording: true
    };
  },
  rewind: (context: SeqStoreContext, action: RewindAction, { emit }: Emit) => {
    log.debug('rewind');
    emit({ type: 'timeUpdate', time: 0 });
    return {
      ...context,
      time: 0,
      playStartedAt: performance.now()
    };
  },
  setEndTime: (context: SeqStoreContext, action: SetEndTimeAction) => {
    // log.debug('setEndTime', action.time);
    return { ...context, endTime: action.time };
  },
  setTime: (
    context: SeqStoreContext,
    action: SetTimeAction,
    { emit }: Emit
  ) => {
    // log.debug('setStartTime', action.time);
    const { time } = context;
    emit({ type: 'timeUpdate', time });

    return {
      ...context,
      time: action.time,
      playStartAt: performance.now()
    };
  }
  // setElapsedTime: (context: SeqStoreContext, action: SetElapsedTimeEvent) => {
  //   log.debug('setElapsedTime', action.time, 'was', context.elapsedTime);
  //   return {
  //     ...context,
  //     elapsedTime: action.time,
  //     playStartedAt: performance.now()
  //   };
  // }
};

const content = {
  types: {
    context: {} as SeqStoreContext,
    events: {} as Actions,
    emitted: {} as SeqEmittedEvents
  },
  context: {
    playStartedAt: 0,
    time: 0,
    endTime: 10000,
    isRecording: false,
    isPlaying: false
  } as SeqStoreContext,
  on: onHandlers
};

export const createStore = () => {
  return createXStateStore(content);
};
