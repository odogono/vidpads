import {
  ProjectStoreContext,
  ToggleStepSequencerEventAction
} from '@model/store/types';
import { updateStepSequencer } from '../helpers';

export const toggleStepSequencerEvent = (
  context: ProjectStoreContext,
  action: ToggleStepSequencerEventAction
): ProjectStoreContext => {
  const { padId, patternIndex, step } = action;
  const stepSequencer = context.stepSequencer ?? {};
  const patterns = stepSequencer?.patterns ?? [];
  const pattern = patterns[patternIndex] ?? {};

  const padSteps = [...(pattern[padId] ?? [])];
  padSteps[step] = !padSteps[step];

  const newPattern = { ...pattern, [padId]: padSteps };
  const newPatterns = [...patterns];
  newPatterns[patternIndex] = newPattern;

  const result = updateStepSequencer(context, {
    patterns: newPatterns
  });

  return result;
};
