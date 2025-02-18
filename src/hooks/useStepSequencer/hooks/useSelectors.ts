'use client';

import { useCallback, useMemo } from 'react';

import { useProject } from '@hooks/useProject';
// import { SequencerEvent } from '@model/types';
import { useSelector } from '@xstate/store/react';

// const evtStr = (e: SequencerEvent) =>
//   `${e.padId}-${e.id}-${e.time}-${e.duration}-${e.isSelected ? 's' : ''}`;

export type UseSelectorsResult = ReturnType<typeof useSelectors>;

export const useSelectors = () => {
  const { project } = useProject();

  // time in seconds
  const time =
    useSelector(project, (state) => state.context.stepSequencer?.time) ?? 0;
  // endTime in seconds
  const endTime =
    useSelector(project, (state) => state.context.stepSequencer?.endTime) ?? 60;

  const isLooped =
    useSelector(project, (state) => state.context.stepSequencer?.isLooped) ??
    true;

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

  const seqEvents = useSelector(
    project,
    (state) => state.context.stepSequencer?.events
  );

  const seqEventsStr = seqEvents ? JSON.stringify(seqEvents) : '';

  // an array of padIds that are active for each step
  const stepToPadIds = useMemo(() => {
    const result: string[][] = [];
    if (!seqEvents) return result;

    const padIds = Object.keys(seqEvents);

    for (const padId of padIds) {
      const padEvents = seqEvents[padId];
      for (let ss = 0; ss < 16; ss++) {
        const event = padEvents[ss];
        if (event) {
          result[ss] = [...(result[ss] ?? []), padId];
        }
      }
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seqEventsStr]);

  // const seqSelectedEvents = seqEvents?.filter((e) => e.isSelected) ?? [];
  // const seqSelectedEventIds = seqSelectedEvents.map((e) => evtStr(e)).join(',');
  // const seqEventIds = seqEvents?.map((e) => evtStr(e)).join(',') ?? '';

  // const getEventsAtTime = useCallback(
  //   (padId: string, time: number) =>
  //     getIntersectingEvents(seqEvents, time, 0.001, [padId]),
  //   [seqEvents]
  // );

  return {
    time,
    endTime,
    isLooped,
    bpm,
    seqEvents,
    seqEventsStr,
    // seqSelectedEvents,
    // seqSelectedEventIds,
    // seqEventIds,
    // getEventsAtTime,
    timeToStep,
    stepToTime,
    stepToPadIds
  };
};
