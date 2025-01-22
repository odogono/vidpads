'use client';

import { useCallback } from 'react';

import { useStore } from '@model/store/useStore';
import { useSelector } from '@xstate/store/react';

/**
 * A hook that returns either the pad specified by the
 * padId or the currently selected pad
 *
 * @param padId
 * @returns
 */
export const usePad = (padId?: string) => {
  const { store } = useStore();

  const selectedPadId = useSelector(
    store,
    (state) => state.context.selectedPadId
  );

  if (!padId && selectedPadId) {
    padId = selectedPadId;
  }

  const pad = useSelector(store, (state) =>
    state.context.pads.find((pad) => pad.id === padId)
  );

  const setPadIsOneShot = useCallback(
    (padId: string, isOneShot: boolean) => {
      if (pad) {
        store.send({ type: 'setPadIsOneShot', padId, isOneShot });
      }
    },
    [pad, store]
  );

  const setPadIsLooped = useCallback(
    (padId: string, isLooped: boolean) => {
      if (pad) {
        store.send({ type: 'setPadIsLooped', padId, isLooped });
      }
    },
    [pad, store]
  );

  const setPadVolume = useCallback(
    (padId: string, volume: number) => {
      if (pad) {
        store.send({ type: 'applyVolumeToPad', padId, volume });
      }
    },
    [pad, store]
  );

  const isLooped = pad?.isLooped;
  const isPadOneShot = pad?.isOneShot;

  return {
    isLooped,
    isPadOneShot,
    pad,
    selectedPadId,
    setPadIsOneShot,
    setPadIsLooped,
    setPadVolume,
    store
  };
};
