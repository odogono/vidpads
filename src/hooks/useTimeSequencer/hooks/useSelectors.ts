'use client';

import { useCallback } from 'react';

import { useProject } from '@hooks/useProject';
import { SequencerEvent } from '@model/types';
import { useSelector } from '@xstate/store/react';
import { getIntersectingEvents } from '../../../model/sequencerEvent';

const evtStr = (e: SequencerEvent) =>
  `${e.padId}-${e.id}-${e.time}-${e.duration}-${e.isSelected ? 's' : ''}`;

export type UseSelectorsResult = ReturnType<typeof useSelectors>;

export const useSelectors = () => {
  const { project } = useProject();

  const canvasBpm = 60;
  const pixelsPerBeat = 16;

  // time in seconds
  const time =
    useSelector(project, (state) => state.context.sequencer.time) ?? 0;
  // endTime in seconds
  const endTime =
    useSelector(project, (state) => state.context.sequencer.endTime) ?? 45;

  const isLooped =
    useSelector(project, (state) => state.context.sequencer.isLooped) ?? false;

  const bpm = useSelector(
    project,
    (state) => state.context.sequencer?.bpm ?? 60
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
    (state) => state.context.sequencer?.events
  );

  const seqSelectedEvents = seqEvents.filter((e) => e.isSelected);
  const seqSelectedEventIds = seqSelectedEvents.map((e) => evtStr(e)).join(',');
  const seqEventIds = seqEvents.map((e) => evtStr(e)).join(',');

  const hasEvents = seqEvents.length > 0;

  const getEventsAtTime = useCallback(
    (padId: string, time: number) =>
      getIntersectingEvents(seqEvents, time, 0.001, [padId]),
    [seqEvents]
  );

  return {
    hasEvents,
    canvasBpm,
    pixelsPerBeat,
    time,
    endTime,
    isLooped,
    bpm,
    seqEvents,
    seqSelectedEvents,
    seqSelectedEventIds,
    seqEventIds,
    getEventsAtTime,
    timeToStep,
    stepToTime
  };
};
