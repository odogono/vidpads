import { useCallback } from 'react';

import { useStore } from '@model/store/useStore';
import { useSelector } from '@xstate/store/react';

export const useSequencer = () => {
  const { store } = useStore();

  const bpm = useSelector(
    store,
    (state) => state.context.sequencer?.bpm ?? 120
  );

  const setBpm = useCallback(
    (bpm: number) => {
      store.send({ type: 'setSequencerBpm', bpm });
    },
    [store]
  );

  return { bpm, setBpm };
};
