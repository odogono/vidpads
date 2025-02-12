import { joinEvents } from '@model/sequencerEvent';
import { AddSequencerEventAction, StoreContext } from '@model/store/types';
import { updateSequencer } from '../helpers';

export const addSequencerEvent = (
  context: StoreContext,
  action: AddSequencerEventAction
): StoreContext => {
  const { evt } = action;
  const sequencer = context.sequencer ?? {};
  const events = sequencer?.events ?? [];

  const newEvents = joinEvents([evt, ...events]);

  return updateSequencer(context, {
    events: newEvents
  });
};
