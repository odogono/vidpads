'use client';

import { useCallback, useMemo } from 'react';

import { useProject } from '@hooks/useProject';
// import { SequencerEvent } from '@model/types';
import { useSelector } from '@xstate/store/react';

export type UseSelectorsResult = ReturnType<typeof useSelectors>;

export const useSelectors = () => {
  const { project } = useProject();

  const bpm = useSelector(
    project,
    (state) => state.context.stepSequencer?.bpm ?? 60
  );

  const timeToStep = useCallback(
    (time: number) => {
      const beatLength = 60000 / bpm;
      const stepPosition = (time / beatLength) * 4;
      return stepPosition;
    },
    [bpm]
  );
  const stepToTime = useCallback(
    (step: number) => {
      const beatLength = 60000 / bpm;
      const stepLength = beatLength / 4;
      const time = step * stepLength;
      return time;
    },
    [bpm]
  );

  const patterns = useSelector(
    project,
    (state) => state.context.stepSequencer?.patterns
  );

  const patternIndex =
    useSelector(
      project,
      (state) => state.context.stepSequencer?.patternIndex
    ) ?? 0;

  const pattern = patterns?.[patternIndex] ?? [];
  const patternCount = patterns?.length ?? 0;

  const patternStr = JSON.stringify(pattern);

  // an array of padIds that are active for each step
  const stepToPadIds = useMemo(() => {
    const result: string[][] = [];
    if (!pattern) return result;

    const padIds = Object.keys(pattern);

    for (const padId of padIds) {
      const padEvents = pattern[padId];
      for (let ss = 0; ss < 16; ss++) {
        const event = padEvents[ss];
        if (event) {
          result[ss] = [...(result[ss] ?? []), padId];
        }
      }
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patternStr]);

  return {
    bpm,
    pattern,
    patternIndex,
    patternCount,
    patternStr,
    timeToStep,
    stepToTime,
    stepToPadIds
  };
};
