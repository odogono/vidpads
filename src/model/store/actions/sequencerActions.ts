import { createLog } from '@helpers/log';
import { isModeActive, isModeEqual } from '@model/helpers';
import {
  createSequencerEvent,
  getIntersectingEvents,
  mergeEvents,
  removeEvents,
  splitEvents
} from '@model/sequencerEvent';
import { EnqueueObject } from '@xstate/store';
import {
  ClearSequencerEventsAction,
  ProjectStoreContext,
  ProjectStoreEvents,
  RemoveSequencerEventAction,
  RewindSequencerAction,
  SetSelectedEventsDurationAction,
  SetSelectedEventsTimeAction,
  SetSequencerEndTimeAction,
  SetSequencerIsLoopedAction,
  SetSequencerTimeAction,
  StartSequencerAction,
  StopSequencerAction,
  ToggleSequencerEventAction
} from '../types';
import {
  addOrReplaceStepSequencerPattern,
  update,
  updateSequencer
} from './helpers';

const log = createLog('sequencer/actions', ['debug']);

export const startSequencer = (
  context: ProjectStoreContext,
  action: StartSequencerAction,
  enqueue: EnqueueObject<ProjectStoreEvents>
): ProjectStoreContext => {
  const { isPlaying, isRecording, mode } = action;

  const isAllMode = isModeEqual(mode, 'all');

  const timeSeqTime = isAllMode ? 0 : (context.sequencer?.time ?? 0);

  const time = isModeActive(mode, 'time') ? timeSeqTime : 0;

  log.debug('startSequencer', {
    isPlaying,
    isRecording,
    mode,
    time: context.sequencer.time
  });

  if (isAllMode) {
    enqueue.emit.sequencerStarted({
      isPlaying,
      isRecording,
      time: 0,
      mode
    });
    context = updateSequencer(context, { time: 0 });
  } else {
    enqueue.emit.sequencerStarted({
      isPlaying,
      isRecording,
      time,
      mode
    });
  }

  return context;
};

export const stopSequencer = (
  context: ProjectStoreContext,
  action: StopSequencerAction,
  enqueue: EnqueueObject<ProjectStoreEvents>
): ProjectStoreContext => {
  const { mode } = action;

  enqueue.emit.sequencerStopped({ mode });
  return context;
};

export const rewindSequencer = (
  context: ProjectStoreContext,
  action: RewindSequencerAction,
  enqueue: EnqueueObject<ProjectStoreEvents>
): ProjectStoreContext => {
  const { mode } = action;

  const endTime = isModeEqual(mode, 'step')
    ? 0
    : (context.sequencer?.time ?? 0);

  enqueue.emit.sequencerTimesUpdated({
    time: 0,
    endTime,
    mode
  });

  if (isModeActive(mode, 'time')) {
    context = updateSequencer(context, { time: 0 });
  }

  return context;
};

export const setSequencerIsLooped = (
  context: ProjectStoreContext,
  action: SetSequencerIsLoopedAction
): ProjectStoreContext => {
  const { isLooped, mode } = action;

  log.debug('setSequencerIsLooped', { isLooped });

  if (isModeActive(mode, 'time')) {
    context = updateSequencer(context, { isLooped });
  }

  return context;
};

export const toggleSequencerEvent = (
  context: ProjectStoreContext,
  event: ToggleSequencerEventAction
): ProjectStoreContext => {
  const { padId, time, duration } = event;
  // log.debug('toggleSequencerEvent', { padId, time, duration });
  const sequencer = context.sequencer ?? {};
  const events = sequencer?.events ?? [];

  const intersectingEvents = getIntersectingEvents(events, time, 0.001, [
    padId
  ]);

  // log.debug('toggleSequencerEvent', { intersectingEvents });

  if (intersectingEvents.length > 0) {
    // const newEvents = events.filter((e, index) => index !== existingEventIndex);
    const newEvents = removeEvents(events, ...intersectingEvents);

    return update(context, {
      sequencer: {
        ...sequencer,
        events: newEvents
      }
    });
  }

  const newEvent = createSequencerEvent({ padId, time, duration });
  const newEvents = [...events, newEvent].toSorted((a, b) => a.time - b.time);

  return update(context, {
    sequencer: {
      ...sequencer,
      events: newEvents
    }
  });
};

export const removeSequencerEvent = (
  context: ProjectStoreContext,
  action: RemoveSequencerEventAction
): ProjectStoreContext => {
  const { padId, time } = action;
  const events = context.sequencer?.events ?? [];

  return updateSequencer(context, {
    events: events.filter((e) => e.padId !== padId || e.time !== time)
  });
};

export const clearSequencerEvents = (
  context: ProjectStoreContext,
  action: ClearSequencerEventsAction
): ProjectStoreContext => {
  const { mode } = action;

  if (isModeEqual(mode, 'step')) {
    const patternIndex = context.stepSequencer?.patternIndex ?? 0;
    return addOrReplaceStepSequencerPattern(context, {}, patternIndex);
  }

  const events = context.sequencer?.events ?? [];

  const [selected, nonSelected] = splitEvents(
    events,
    (evt) => !!evt.isSelected
  );

  log.debug(
    'clearSequencerEvents',
    `selected:${selected.length} non-selected:${nonSelected.length}`
  );

  if (selected.length > 0) {
    return updateSequencer(context, {
      events: nonSelected
    });
  }

  return updateSequencer(context, {
    events: []
  });
};

export const setSequencerTime = (
  context: ProjectStoreContext,
  action: SetSequencerTimeAction,
  enqueue: EnqueueObject<ProjectStoreEvents>
): ProjectStoreContext => {
  const { time, mode } = action;

  if (isModeEqual(mode, 'step')) {
    return context;
  }

  const timeSeqEndTime = context.sequencer?.endTime ?? 0;

  // const value = Math.max(0, Math.min(time, timeSeqTime));
  enqueue.emit.sequencerTimesUpdated({
    time: time,
    endTime: timeSeqEndTime,
    mode
  });
  log.debug('setSequencerTime', { time, timeSeqEndTime });

  return updateSequencer(context, { time });
};

export const setSequencerEndTime = (
  context: ProjectStoreContext,
  action: SetSequencerEndTimeAction,
  enqueue: EnqueueObject<ProjectStoreEvents>
): ProjectStoreContext => {
  const { endTime, mode } = action;

  if (isModeEqual(mode, 'step')) {
    return context;
  }

  const { time } = context.sequencer ?? { time: 0 };
  const value = Math.max(0, Math.max(endTime, 1));

  const newTime = Math.max(0, Math.min(time, value));

  enqueue.emit.sequencerTimesUpdated({
    time: newTime,
    endTime: value,
    mode
  });

  return update(context, {
    sequencer: { ...context.sequencer, endTime: value, time: newTime }
  });
};

export const setSelectedEventsTime = (
  context: ProjectStoreContext,
  action: SetSelectedEventsTimeAction
): ProjectStoreContext => {
  const { time } = action;
  const sequencer = context.sequencer ?? {};
  const events = sequencer?.events ?? [];

  const selectedEvents = events.filter((evt) => evt.isSelected);

  if (selectedEvents.length === 0) {
    return context;
  }

  // we are changing the time relatively, not absolutely

  const initialTime = selectedEvents[0].time;
  const timeDelta = time - initialTime;

  const changedEvents = selectedEvents.map((evt) => ({
    ...evt,
    time: evt.time + timeDelta
  }));

  const newEvents = mergeEvents(...changedEvents, ...events);

  return update(context, { sequencer: { ...sequencer, events: newEvents } });
};

export const setSelectedEventsDuration = (
  context: ProjectStoreContext,
  action: SetSelectedEventsDurationAction
): ProjectStoreContext => {
  const { duration } = action;
  const sequencer = context.sequencer ?? {};
  const events = sequencer?.events ?? [];

  const selectedEvents = events.filter((evt) => evt.isSelected);

  const changedEvents = selectedEvents.map((evt) => ({
    ...evt,
    duration
  }));

  // log.debug(
  //   'setSelectedEventsDuration',
  //   changedEvents.length,
  //   'changed duration to',
  //   duration
  // );

  const newEvents = mergeEvents(...changedEvents, ...events);

  return update(context, { sequencer: { ...sequencer, events: newEvents } });
};
