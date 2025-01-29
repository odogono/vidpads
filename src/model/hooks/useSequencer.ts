import { useCallback, useMemo } from 'react';

import { createLog } from '@helpers/log';
import { useStore } from '@model/store/useStore';
import { useSelector } from '@xstate/store/react';
import { SequencerEvent } from '../types';

const log = createLog('sequencer/useSequencer');

export const useSequencer = () => {
  const { store } = useStore();

  const startTime =
    useSelector(store, (state) => state.context.sequencer?.startTime) ?? 0;
  const endTime =
    useSelector(store, (state) => state.context.sequencer?.endTime) ?? 30;

  const setStartTime = useCallback(
    (startTime: number) =>
      store.send({ type: 'setSequencerStartTime', startTime }),
    [store]
  );

  const setEndTime = useCallback(
    (endTime: number) => store.send({ type: 'setSequencerEndTime', endTime }),
    [store]
  );

  const bpm = useSelector(
    store,
    (state) => state.context.sequencer?.bpm ?? 120
  );

  const evtStr = (e: SequencerEvent) =>
    `${e.padId}-${e.id}-${e.time}-${e.duration}-${e.isSelected ? 's' : ''}`;

  const events =
    useSelector(store, (state) => state.context.sequencer?.events) ?? [];
  const selectedEvents = events.filter((e) => e.isSelected);
  const selectedEventIds = selectedEvents.map((e) => evtStr(e)).join(',');
  const eventIds = events.map((e) => evtStr(e)).join(',');

  const setBpm = useCallback(
    (bpm: number) => {
      store.send({ type: 'setSequencerBpm', bpm });
    },
    [store]
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

  const toggleEvent = useCallback(
    (padId: string, startTime: number, endTime: number) => {
      store.send({
        type: 'toggleSequencerEvent',
        padId,
        time: startTime,
        duration: endTime - startTime
      });
    },
    [store]
  );

  const clearEvents = useCallback(() => {
    store.send({ type: 'clearSequencerEvents' });
  }, [store]);

  const addEvent = useCallback(
    (padId: string, time: number, duration: number) => {
      store.send({ type: 'addSequencerEvent', padId, time, duration });
    },
    [store]
  );

  const removeEvent = useCallback(
    (padId: string, time: number) => {
      store.send({ type: 'removeSequencerEvent', padId, time });
    },
    [store]
  );

  const selectEvents = useCallback(
    (padIds: string[], time: number, duration: number) => {
      store.send({ type: 'selectSequencerEvents', padIds, time, duration });
    },
    [store]
  );

  const moveEvents = useCallback(
    (timeDelta: number) => {
      store.send({ type: 'moveSequencerEvents', timeDelta });
    },
    [store]
  );

  return {
    bpm,
    events,
    eventIds,
    setBpm,
    toggleEvent,
    stepToTime,
    timeToStep,
    clearEvents,
    addEvent,
    removeEvent,
    selectEvents,
    selectedEvents,
    selectedEventIds,
    moveEvents,
    startTime,
    endTime,
    setStartTime,
    setEndTime
  };
};
