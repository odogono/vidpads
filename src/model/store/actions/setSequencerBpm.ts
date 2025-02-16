import { ProjectStoreContext, SetSequencerBpmAction } from '../types';

export const setSequencerBpm = (
  context: ProjectStoreContext,
  event: SetSequencerBpmAction
): ProjectStoreContext => {
  const { bpm } = event;
  return { ...context, sequencer: { ...context.sequencer, bpm } };
};
