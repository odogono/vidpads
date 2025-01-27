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
  const { padId, time, duration } = action;
  const sequencer = context.sequencer ?? {};
  const events = sequencer?.events ?? [];

  return update(context, {
    sequencer: {
      ...sequencer,
      events: [...events, { padId, time, duration }]
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
