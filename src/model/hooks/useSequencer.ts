import { useCallback } from 'react';

import { useStore } from '@model/store/useStore';
import { useSelector } from '@xstate/store/react';

export const useSequencer = () => {
  const { store } = useStore();

  const bpm = useSelector(
    store,
    (state) => state.context.sequencer?.bpm ?? 120
  );

  const events =
    useSelector(store, (state) => state.context.sequencer?.events) ?? [];

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

  return { bpm, events, setBpm, toggleEvent, stepToTime, timeToStep };
};
