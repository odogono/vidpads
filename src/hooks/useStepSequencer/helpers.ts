import { stepSequencerUrl } from '@helpers/url';
import {
  exportStepSequencerPatternToURLString,
  importStepSequencerPatternFromURLString
} from '@model/serialise/stepSequencer';
import { StepSequencerPattern } from '@model/types';

export const createStepSequencerPatternUrl = (
  pattern: StepSequencerPattern
) => {
  const data = exportStepSequencerPatternToURLString(pattern);
  const url = new URL(stepSequencerUrl);
  if (data) {
    url.searchParams.set('pattern', data);
  }
  return url.toString();
};

export const parseStepSequencerPatternUrl = (
  url: string | undefined
): StepSequencerPattern | undefined => {
  if (!url) return undefined;

  if (!url.startsWith(stepSequencerUrl)) return undefined;

  const urlObj = new URL(url);
  const data = urlObj.searchParams.get('pattern');
  if (!data) return undefined;

  return importStepSequencerPatternFromURLString(data);
};
