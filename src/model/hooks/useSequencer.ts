import { useCallback, useMemo } from 'react';

import { createLog } from '@helpers/log';
import { useStore } from '@model/store/useStore';
import { useSelector } from '@xstate/store/react';

const log = createLog('sequencer/useSequencer');

export const useSequencer = () => {
  const { store } = useStore();

  const bpm = useSelector(
    store,
    (state) => state.context.sequencer?.bpm ?? 120
  );

  const events =
    useSelector(store, (state) => state.context.sequencer?.events) ?? [];
  const selectedEvents = events.filter((e) => e.isSelected);
  const selectedEventIds = selectedEvents.map((e) => e.id).join(',');

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
    moveEvents
  };
};
