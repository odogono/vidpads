import { createLog } from '@helpers/log';
import {
  getIntersectingEvents,
  joinEvents,
  mergeEvents,
  quantizeEvents,
  removeEvents
} from '@model/sequencerEvent';
import {
  AddSequencerEventAction,
  RemoveSequencerEventAction,
  SelectSequencerEventsAction,
  SetSelectedSeqEventIdAction,
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
  const sequencer = context.sequencer ?? {};
  const events = sequencer?.events ?? [];

  const existingEventIndex = events.findIndex(
    (e) => e.padId === padId && e.time === time
  );
  if (existingEventIndex !== -1) {
    const newEvents = events.filter((e, index) => index !== existingEventIndex);

    return update(context, {
      sequencer: {
        ...sequencer,
        events: newEvents
      }
    });
  }

  return update(context, {
    sequencer: {
      ...sequencer,
      // todo - better indexing by time
      events: [...events, { padId, time, duration }]
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

  const { time, duration } = quantizeEvents([action], quantizeStep)[0];

  const intersectingEvents = getIntersectingEvents(events, time, duration, [
    padId
  ]);

  // if no intersecting events, just add the new event
  if (!intersectingEvents.length) {
    const newEvents = [...events, { padId, time, duration }].toSorted(
      (a, b) => a.time - b.time
    );
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
    ...[{ padId, time, duration }, ...intersectingEvents]
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
  return update(context, { sequencer: { ...context.sequencer, events: [] } });
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

  const selectedEvents = intersectingEvents.map((evt) => ({
    ...evt,
    isSelected: true
  }));

  const mergedEvents = mergeEvents(...selectedEvents, ...deSelectedEvents);

  return update(context, { sequencer: { ...sequencer, events: mergedEvents } });
};
