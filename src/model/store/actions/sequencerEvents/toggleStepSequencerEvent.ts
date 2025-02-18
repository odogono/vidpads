import {
  ProjectStoreContext,
  ToggleStepSequencerEventAction
} from '@model/store/types';
import { updateStepSequencer } from '../helpers';

export const toggleStepSequencerEvent = (
  context: ProjectStoreContext,
  action: ToggleStepSequencerEventAction
): ProjectStoreContext => {
  const { padId, step } = action;
  const stepSequencer = context.stepSequencer ?? {};
  const events = stepSequencer?.events ?? {};

  const padSteps = [...(events[padId] ?? [])];
  padSteps[step] = !padSteps[step];

  const newEvents = { ...events, [padId]: padSteps };

  return updateStepSequencer(context, {
    events: newEvents
  });
};
