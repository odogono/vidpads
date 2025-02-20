import {
  ProjectStoreContext,
  SetStepSequencerPatternIndexAction
} from '@model/store/types';
import { updateStepSequencer } from '../helpers';

export const setStepSequencerPatternIndex = (
  context: ProjectStoreContext,
  action: SetStepSequencerPatternIndexAction
): ProjectStoreContext => {
  const { index } = action;
  const patternIndex = context.stepSequencer?.patternIndex ?? 0;

  if (patternIndex === index) {
    return context;
  }

  const patterns = context.stepSequencer?.patterns ?? [];

  if (patterns.length <= 0) {
    return updateStepSequencer(context, { patternIndex: 0 });
  }

  const newPatternIndex =
    ((index ?? context.stepSequencer?.patternIndex ?? 0) + patterns.length) %
    patterns.length;

  return updateStepSequencer(context, { patternIndex: newPatternIndex });
};
