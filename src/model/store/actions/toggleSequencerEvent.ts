import { StoreContext, ToggleSequencerEventAction } from '../types';
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
