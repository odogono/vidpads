import { SetSelectedSeqEventIdAction, StoreContext } from '../types';
import { update } from './helpers';

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
