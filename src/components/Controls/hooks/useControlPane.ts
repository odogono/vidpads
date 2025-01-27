'use client';

import { useCallback } from 'react';

import { useStore } from '@model/store/useStore';
import { useSelector } from '@xstate/store/react';

export const useControlPane = () => {
  const { store } = useStore();

  const selectedControlPane = useSelector(
    store,
    (state) => state.context.selectedControlPane ?? 'state'
  );

  const setSelectedControlPane = useCallback(
    (pane: 'state' | 'interval' | 'sequencer' | 'details') => {
      store.send({ type: 'setSelectedControlPane', pane });
    },
    [store]
  );

  const cycleToNextControlPane = useCallback(() => {
    let nextPane: 'state' | 'interval' | 'sequencer' | 'details' = 'state';
    switch (selectedControlPane) {
      case 'state':
        nextPane = 'interval';
        break;
      case 'interval':
        nextPane = 'details';
        break;
      case 'details':
        nextPane = 'sequencer';
        break;
      case 'sequencer':
        nextPane = 'state';
        break;
      default:
        nextPane = 'state';
        break;
    }

    setSelectedControlPane(nextPane);
  }, [setSelectedControlPane, selectedControlPane]);

  return {
    selectedControlPane,
    setSelectedControlPane,
    cycleToNextControlPane
  };
};
