import {
  getIntersectingEvents,
  joinEvents,
  quantizeEvents,
  removeEvents
} from '@model/sequencerEvent';
import {
  AddSequencerEventAction,
  RemoveSequencerEventAction,
  StoreContext,
  ToggleSequencerEventAction
} from '../types';
import { update } from './helpers';

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
