import { createLog } from '@helpers/log';
import {
  AddStepSequencerPatternAction,
  ProjectStoreContext
} from '@model/store/types';
import { copyStepSequencerPattern, updateStepSequencer } from '../helpers';

const log = createLog('actions/addStepSequencerPattern', ['debug']);

export const addStepSequencerPattern = (
  context: ProjectStoreContext,
  action: AddStepSequencerPatternAction
): ProjectStoreContext => {
  const { copy, setIndex } = action;

  const patternIndex = context.stepSequencer?.patternIndex ?? 0;
  const patterns = context.stepSequencer?.patterns ?? [{}];
  const newPatternIndex = patternIndex + 1;

  if (patterns.length >= 99) {
    log.debug('max patterns reached');
    return context;
  }

  const newPatterns = [...patterns];

  const newPattern = copy
    ? copyStepSequencerPattern(patterns[patternIndex])
    : {};

  if (patternIndex === patterns.length - 1) {
    newPatterns.push(newPattern);
    // if (setIndex) newPatternIndex = newPatterns.length - 1;
  } else {
    log.debug('inserting new pattern at index', patternIndex);
    // insert the new pattern at the patternIndex
    newPatterns.splice(newPatternIndex, 0, newPattern);
    // if (setIndex) newPatternIndex = patternIndex;
  }

  log.debug('addStepSequencerPattern', {
    patternIndex,
    patterns,
    newPatterns
  });

  return updateStepSequencer(context, {
    patterns: newPatterns,
    patternIndex: setIndex ? newPatternIndex : patternIndex
  });
};
