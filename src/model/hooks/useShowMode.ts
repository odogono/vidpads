'use client';

import { useCallback } from 'react';

import { useStore } from '@model/store/useStore';
import type { ShowMode } from '@model/types';
import { useSelector } from '@xstate/store/react';

export const useShowMode = () => {
  const { store } = useStore();
  const showMode = useSelector(store, (state) => state.context.showMode);

  const setShowMode = useCallback(
    (mode: ShowMode) => {
      store.send({ type: 'setShowMode', mode });
    },
    [store]
  );

  const isPadsVisible = !showMode || showMode === 'pads';
  const isSequencerVisible = showMode === 'sequencer';

  return {
    isPadsVisible,
    isSequencerVisible,
    showMode,
    setShowMode
  };
};
