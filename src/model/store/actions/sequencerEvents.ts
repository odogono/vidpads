import { createLog } from '@helpers/log';
import {
  createSequencerEvent,
  getIntersectingEvents,
  mergeEvents,
  removeEvents,
  splitEvents
} from '@model/sequencerEvent';
import {
  Emit,
  ProjectStoreContext,
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
import { update, updateSequencer, updateStepSequencer } from './helpers';

const log = createLog('sequencer/events');

export const startSequencer = (
  context: ProjectStoreContext,
  action: StartSequencerAction,
  { emit }: Emit
): ProjectStoreContext => {
  const { isPlaying, isRecording, isStep } = action;

  const time = isStep
    ? 0 //(context.stepSequencer?.time ?? 0)
    : (context.sequencer?.time ?? 0);

  emit({
    type: 'sequencerStarted',
    isPlaying,
    isRecording,
    time,
    isStep
  });

  if (isStep) {
    return updateStepSequencer(context, { time });
  }

  return context;
};

export const stopSequencer = (
  context: ProjectStoreContext,
  action: StopSequencerAction,
  { emit }: Emit
): ProjectStoreContext => {
  const { isStep } = action;

  emit({ type: 'sequencerStopped', isStep });
  return context;
};

export const rewindSequencer = (
  context: ProjectStoreContext,
  action: RewindSequencerAction,
  { emit }: Emit
): ProjectStoreContext => {
  const { isStep } = action;

  const endTime = isStep
    ? (context.stepSequencer?.time ?? 0)
    : (context.sequencer?.time ?? 0);

  emit({
    type: 'sequencerTimesUpdated',
    time: 0,
    endTime
  });

  if (isStep) {
    return updateStepSequencer(context, { time: 0 });
  }

  return updateSequencer(context, { time: 0 });
};

export const setSequencerIsLooped = (
  context: ProjectStoreContext,
  action: SetSequencerIsLoopedAction
): ProjectStoreContext => {
  const { isLooped } = action;
  log.debug('setSequencerIsLooped', { isLooped });
  return updateSequencer(context, { isLooped });
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
  context: ProjectStoreContext
): ProjectStoreContext => {
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
  { emit }: Emit
): ProjectStoreContext => {
  const { time } = action;
  const value = Math.max(0, Math.min(time, context.sequencer?.endTime ?? 0));
  emit({
    type: 'sequencerTimesUpdated',
    time: value,
    endTime: context.sequencer?.endTime ?? 0
  });
  // log.debug('setSequencerTime', { time, value });

  return updateSequencer(context, { time: value });
};

export const setSequencerEndTime = (
  context: ProjectStoreContext,
  action: SetSequencerEndTimeAction,
  { emit }: Emit
): ProjectStoreContext => {
  const { endTime } = action;
  const { time } = context.sequencer ?? { time: 0 };
  const value = Math.max(0, Math.max(endTime, 1));

  const newTime = Math.max(0, Math.min(time, value));

  emit({
    type: 'sequencerTimesUpdated',
    time: newTime,
    endTime: value
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
