import { createLog } from '@helpers/log';
import {
  createEvent,
  getIntersectingEvents,
  joinEvents,
  mergeEvents,
  quantizeEvents,
  removeEvents
} from '@model/sequencerEvent';
import {
  AddSequencerEventAction,
  Emit,
  MoveSequencerEventsAction,
  RemoveSequencerEventAction,
  SelectSequencerEventsAction,
  SetSelectedEventsDurationAction,
  SetSelectedEventsTimeAction,
  SetSelectedSeqEventIdAction,
  SetSequencerEndTimeAction,
  SetSequencerStartTimeAction,
  StoreContext,
  ToggleSequencerEventAction
} from '../types';
import { update } from './helpers';

const log = createLog('sequencer/events');

export const setSelectedSeqEventId = (
  context: StoreContext,
  event: SetSelectedSeqEventIdAction
): StoreContext => {
  const { eventId } = event;

  return update(context, {
    sequencer: {
      ...context.sequencer,
      selectedEventId: eventId
    }
  });
};

export const toggleSequencerEvent = (
  context: StoreContext,
  event: ToggleSequencerEventAction
): StoreContext => {
  const { padId, time, duration } = event;
  // log.debug('toggleSequencerEvent', { padId, time, duration });
  const sequencer = context.sequencer ?? {};
  const events = sequencer?.events ?? [];

  const intersectingEvents = getIntersectingEvents(events, time, duration, [
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

  const id = events.length;
  return update(context, {
    sequencer: {
      ...sequencer,
      // todo - better indexing by time
      events: [...events, { padId, time, duration, id }].toSorted(
        (a, b) => a.time - b.time
      )
    }
  });
};

export const addSequencerEvent = (
  context: StoreContext,
  action: AddSequencerEventAction
): StoreContext => {
  const { padId, quantizeStep = 1 } = action;
  const sequencer = context.sequencer ?? {};
  const events = sequencer?.events ?? [];

  const { time, duration } = quantizeEvents(
    [createEvent(action)],
    quantizeStep
  )[0];

  const intersectingEvents = getIntersectingEvents(events, time, duration, [
    padId
  ]);

  // if no intersecting events, just add the new event
  if (!intersectingEvents.length) {
    const newEvents = [
      ...events,
      createEvent({ padId, time, duration })
    ].toSorted((a, b) => a.time - b.time);
    return update(context, {
      sequencer: {
        ...sequencer,
        events: newEvents
      }
    });
  }

  // remove the intersecting events
  const newEvents = removeEvents(events, ...intersectingEvents);

  // join the new event with the intersecting events
  const joinedEvent = joinEvents(
    ...[createEvent(action), ...intersectingEvents]
  );

  if (joinedEvent) {
    newEvents.push(joinedEvent);
  }

  return update(context, {
    sequencer: {
      ...sequencer,
      events: newEvents.toSorted((a, b) => a.time - b.time)
    }
  });
};

export const removeSequencerEvent = (
  context: StoreContext,
  action: RemoveSequencerEventAction
): StoreContext => {
  const { padId, time } = action;
  const sequencer = context.sequencer ?? {};
  const events = sequencer?.events ?? [];

  return update(context, {
    sequencer: {
      ...sequencer,
      events: events.filter((e) => e.padId !== padId || e.time !== time)
    }
  });
};

export const clearSequencerEvents = (context: StoreContext): StoreContext => {
  const sequencer = context.sequencer ?? {};
  const events = sequencer?.events ?? [];

  const selectedEvents = events.filter((evt) => evt.isSelected);

  const newEvents =
    selectedEvents.length > 0 ? removeEvents(events, ...selectedEvents) : [];

  log.debug(
    'clearSequencerEvents',
    selectedEvents.length > 0 ? selectedEvents.length : events.length
  );

  return update(context, { sequencer: { ...sequencer, events: newEvents } });
};

export const selectSequencerEvents = (
  context: StoreContext,
  action: SelectSequencerEventsAction
): StoreContext => {
  const { padIds, time, duration } = action;
  const sequencer = context.sequencer ?? {};
  const events = sequencer?.events ?? [];

  const deSelectedEvents = events.map((evt) => ({
    ...evt,
    isSelected: false
  }));

  const intersectingEvents = getIntersectingEvents(
    deSelectedEvents,
    time,
    duration,
    padIds
  );

  // log.debug(
  //   'selectSequencerEvents',
  //   intersectingEvents.length,
  //   `(${intersectingEvents.map((e) => e.id).join(',')})`,
  //   'selected /',
  //   deSelectedEvents.length
  // );

  const selectedEvents = intersectingEvents.map((evt) => ({
    ...evt,
    isSelected: true
  }));

  const mergedEvents = mergeEvents(...selectedEvents, ...deSelectedEvents);

  // log.debug('selectSequencerEvents', mergedEvents.map((e) => e.id).join(','));

  return update(context, { sequencer: { ...sequencer, events: mergedEvents } });
};

export const moveSequencerEvents = (
  context: StoreContext,
  action: MoveSequencerEventsAction
): StoreContext => {
  const { timeDelta, isFinished } = action;
  const sequencer = context.sequencer ?? {};
  const events = sequencer?.events ?? [];

  const selectedEvents = events.filter((evt) => evt.isSelected);

  const movedEvents = selectedEvents.map((evt) => ({
    ...evt,
    time: Math.max(0, evt.time + timeDelta)
  }));

  const quantizedEvents = isFinished
    ? movedEvents //quantizeEvents(movedEvents, 16)
    : movedEvents;

  // log.debug('moveSequencerEvents moved', movedEvents.length);
  const newEvents = mergeEvents(...quantizedEvents, ...events);

  // log.debug('moveSequencerEvents newEvents', newEvents.length);

  return update(context, { sequencer: { ...sequencer, events: newEvents } });
};

export const setSequencerStartTime = (
  context: StoreContext,
  action: SetSequencerStartTimeAction,
  { emit }: Emit
): StoreContext => {
  const { startTime } = action;
  const value = Math.max(
    0,
    Math.min(startTime, context.sequencer?.endTime ?? 0)
  );
  emit({
    type: 'sequencerTimesUpdated',
    startTime: value,
    endTime: context.sequencer?.endTime ?? 0
  });
  return update(context, {
    sequencer: { ...context.sequencer, startTime: value }
  });
};

export const setSequencerEndTime = (
  context: StoreContext,
  action: SetSequencerEndTimeAction,
  { emit }: Emit
): StoreContext => {
  const { endTime } = action;
  const value = Math.max(
    0,
    Math.max(endTime, context.sequencer?.startTime ?? 0)
  );

  emit({
    type: 'sequencerTimesUpdated',
    startTime: context.sequencer?.startTime ?? 0,
    endTime: value
  });

  return update(context, {
    sequencer: { ...context.sequencer, endTime: value }
  });
};

export const setSelectedEventsTime = (
  context: StoreContext,
  action: SetSelectedEventsTimeAction
): StoreContext => {
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
  context: StoreContext,
  action: SetSelectedEventsDurationAction
): StoreContext => {
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
