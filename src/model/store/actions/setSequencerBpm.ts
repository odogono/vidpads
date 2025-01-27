import { SetSequencerBpmAction, StoreContext } from '../types';

export const setSequencerBpm = (
  context: StoreContext,
  event: SetSequencerBpmAction
): StoreContext => {
  const { bpm } = event;
  return { ...context, sequencer: { ...context.sequencer, bpm } };
};
