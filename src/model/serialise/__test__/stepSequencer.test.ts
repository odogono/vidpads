import { initialContext } from '@model/store/store';
import { ProjectStoreContextType } from '@model/store/types';
import { StepSequencerSteps } from '../../types';
import {
  exportStepSequencerToJSON,
  exportStepSequencerToURLString,
  importStepSequencerFromJSON,
  importStepSequencerFromURLString,
  numberToSteps,
  padSteps,
  stepsToNumber,
  unpadSteps
} from '../stepSequencer';

describe('importStepSequencerFromJSON', () => {
  it('should import step sequencer from no JSON', () => {
    const result = importStepSequencerFromJSON(undefined);
    expect(result).toEqual(initialContext.stepSequencer);
  });

  it('should import step sequencer from JSON', () => {
    const result = importStepSequencerFromJSON({
      bpm: 120,
      patternIndex: 0,
      patterns: [[{ padId: 'a1', steps: [1, 0, 1, 0, 1, 0, 1] }]]
    });

    expect(result).toEqual({
      bpm: 120,
      patternIndex: 0,
      patterns: [{ a1: [true, false, true, false, true, false, true] }]
    });
  });
});

describe('exportSequencerToURLString', () => {
  it('should return undefined for undefined input', () => {
    expect(exportStepSequencerToURLString(undefined)).toBeUndefined();
  });

  it('should correctly format sequencer state as URL string', () => {
    const stepSequencer = {
      bpm: 120,
      patternIndex: 0,
      patterns: [
        {
          pad1: [false, true],
          pad2: [true, false]
        },
        {
          pad3: [false, true]
        }
      ]
    } as ProjectStoreContextType['stepSequencer'];

    const json = exportStepSequencerToJSON(stepSequencer);
    const result = exportStepSequencerToURLString(stepSequencer);

    expect(result).toBe('120[pad1(16384:pad2(32768+pad3(16384');

    const result2 = importStepSequencerFromURLString(result!);

    expect(result2).toEqual(json);
  });
});

describe('importStepSequencerFromURLString', () => {
  it('should import step sequencer from URL string', () => {
    const result = importStepSequencerFromURLString('60[a1(43520');

    // console.debug(JSON.stringify(result, null, '\t'));

    expect(result).toEqual({
      bpm: 60,
      patternIndex: 0,
      patterns: [[{ padId: 'a1', steps: [1, 0, 1, 0, 1, 0, 1] }]]
    });
  });
});

describe('stepsToNumber', () => {
  it('should pad a steps array to 16 steps', () => {
    const steps: StepSequencerSteps = [1, 0, 1];
    const result = padSteps(steps);
    expect(result).toEqual([1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('should unpad a steps array to the original steps', () => {
    const steps: StepSequencerSteps = [
      1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];
    const result = unpadSteps(steps);
    expect(result).toEqual([1, 0, 1]);
  });

  it('should unpad a sparse steps array', () => {
    const steps: StepSequencerSteps = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1
    ];
    const result = unpadSteps(steps);
    expect(result).toEqual(steps);
  });

  it('should convert steps to number', () => {
    const steps: StepSequencerSteps = [1, 0, 1];
    const result = stepsToNumber(steps);
    expect(numberToSteps(result)).toEqual(steps);
  });

  it('should convert number to steps', () => {
    // console.log(stepsToNumber([0, 1]));
    expect(padSteps([0, 1])).toEqual([
      0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ]);

    expect(numberToSteps(stepsToNumber([0, 1]))).toEqual([0, 1]);
  });
});
