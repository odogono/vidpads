import { createLog } from '@helpers/log';
import { safeParseFloat, safeParseInt } from '@helpers/number';
import { ProjectStoreContextType } from '@model/store/types';
import { initialContext } from '../store/store';
import {
  StepSequencerExport,
  StepSequencerPattern,
  StepSequencerPatternExport,
  StepSequencerSteps
} from '../types';

const log = createLog('serialise/stepSequencer', ['debug']);

type StepSequencerType = ProjectStoreContextType['stepSequencer'];

export const exportStepSequencerToJSON = (
  sequencer: StepSequencerType | undefined
): StepSequencerExport | undefined => {
  if (!sequencer) {
    return undefined;
  }

  const { bpm, patterns } = sequencer;

  const patternsJSON = patterns?.map(exportStepSequencerPatternToJSON) ?? [];

  if (patternsJSON.length === 0 && initialContext.stepSequencer.bpm === bpm) {
    return undefined;
  }

  return {
    bpm,
    patternIndex: 0,
    patterns: patternsJSON
  };
};

export const importStepSequencerFromJSON = (
  json: StepSequencerExport | undefined
) => {
  if (!json) {
    return initialContext.stepSequencer;
  }

  const { bpm, patternIndex, patterns } = json;

  return {
    bpm,
    patternIndex: patternIndex ?? 0,
    patterns: patterns?.map(importStepSequencerPatternFromJSON) ?? []
  };
};

export const exportStepSequencerPatternToJSON = (
  pattern: StepSequencerPattern
) => {
  const result = Object.entries(pattern)
    .map(([padId, steps]) => {
      const stepsJSON: StepSequencerSteps = Array.from({ length: 16 }, () => 0);
      steps.forEach((step, index) => (stepsJSON[index] = step ? 1 : 0));
      const unpaddedSteps = unpadSteps(stepsJSON);
      const hasSteps = unpaddedSteps.find((step) => step === 1);
      if (!hasSteps) {
        return undefined;
      }
      return {
        padId,
        steps: unpaddedSteps
      } as StepSequencerPatternExport;
    })
    .filter(Boolean) as StepSequencerPatternExport[];

  return result;
};

export const importStepSequencerPatternFromJSON = (
  json: StepSequencerPatternExport[]
): StepSequencerPattern => {
  if (!json) {
    return {};
  }

  // log.debug('importStepSequencerPatternFromJSON', json);

  return json.reduce((acc, entry) => {
    acc[entry.padId] = entry.steps.map((step) => step === 1);
    return acc;
  }, {} as StepSequencerPattern);
};

export const exportStepSequencerToURLString = (
  sequencer: StepSequencerType | undefined
) => {
  const json = exportStepSequencerToJSON(sequencer);
  if (!json) {
    return undefined;
  }

  const { bpm, patterns } = json;

  const stepsStr = patterns
    ?.map((pattern) => {
      // stepsToNumber(pattern.steps)
      return pattern
        .map(({ padId, steps }) => {
          return `${padId}(${stepsToNumber(steps)}`;
        })
        .join(':');
    })
    .join('+');

  return `${bpm}[${stepsStr}`;
};

export const exportStepSequencerPatternToURLString = (
  pattern: StepSequencerPattern
) => {
  return Object.entries(pattern)
    .map(([padId, steps]) => {
      if (!steps || steps.length === 0) return undefined;
      return `${padId}(${stepsToNumber(steps.map((step) => (step ? 1 : 0)))})`;
    })
    .filter(Boolean)
    .join(':');
};

export const importStepSequencerPatternFromURLString = (
  urlString: string
): StepSequencerPattern => {
  return urlString.split(':').reduce((acc, part) => {
    const [padId, steps] = part.split('(');
    acc[padId] = numberToSteps(safeParseInt(steps, 0)).map(
      (step) => step === 1
    );
    return acc;
  }, {} as StepSequencerPattern);
};

export const importStepSequencerFromURLString = (
  urlString: string
): StepSequencerExport => {
  const [bpm, patternsStr] = urlString.split('[');

  log.debug('importStepSequencerFromURLString', {
    bpm,
    patternsStr
  });

  const patterns = patternsStr.split('+').map((pattern) => {
    return pattern.split(':').map((sub) => {
      const parts = sub.split('(');
      return parts.reduce(
        (acc, part, index) => {
          if (index === 0) {
            acc.padId = part;
          } else {
            const steps = numberToSteps(safeParseInt(part, 0));
            acc.steps = steps;
          }
          return acc;
        },
        {} as { padId: string; steps: StepSequencerSteps }
      );
    });
  });

  return {
    bpm: safeParseFloat(bpm),
    patternIndex: 0,
    patterns
  };
};

export const stepsToNumber = (steps: StepSequencerSteps): number => {
  let result = 0;

  steps = padSteps(steps);
  for (const bit of steps) {
    result = (result << 1) | bit;
  }

  return result;
};

export const numberToSteps = (number: number): StepSequencerSteps => {
  const bits: StepSequencerSteps = [];
  for (let i = 15; i >= 0; i--) {
    bits.push(((number >> i) & 1) as 0 | 1);
  }
  return unpadSteps(bits);
};

export const padSteps = (steps: StepSequencerSteps): StepSequencerSteps => {
  return Array.from({ length: 16 }, (_, i) => steps[i] ?? 0);
};

export const unpadSteps = (steps: StepSequencerSteps): StepSequencerSteps => {
  return steps.slice(0, steps.findLastIndex((step) => step === 1) + 1);
};
