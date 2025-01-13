'use client';

import { useCallback } from 'react';

import { useSelector } from '@xstate/store/react';
import { getPadSourceUrl, getPadStartAndEndTime } from '../pad';
import { Pad } from '../types';
import { StoreType } from './types';
import { useStore } from './useStore';

export const usePads = () => {
  const { store, isReady } = useStore();
  const pads = useSelector(store, (state) => state.context.pads) ?? [];

  // Sort pads using natural sort to handle numbers correctly
  const sortedPads = pads.sort((a, b) => {
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  return { isReady, pads: sortedPads, store };
};

export const getPadById = (
  store: StoreType,
  padId: string
): Pad | undefined => {
  const { pads } = store.getSnapshot().context;
  return pads.find((pad) => pad.id === padId);
};

export const getPadsBySourceUrl = (
  store: StoreType,
  sourceUrl: string
): Pad[] => {
  const { pads } = store.getSnapshot().context;
  return pads.filter((pad) => getPadSourceUrl(pad) === sourceUrl);
};

export const getSelectedPadId = (store: StoreType): string | undefined =>
  store.getSnapshot().context.selectedPadId ?? undefined;

export const getSelectedPadSourceUrl = (
  store: StoreType
): string | undefined => {
  const selectedPadId = getSelectedPadId(store);
  if (!selectedPadId) return undefined;
  return getPadSourceUrl(getPadById(store, selectedPadId));
};

export const getSelectedPadStartAndEndTime = (
  store: StoreType
): {
  start: number;
  end: number;
} => {
  const selectedPadId = getSelectedPadId(store);
  if (!selectedPadId) return { start: -1, end: -1 };
  const pad = getPadById(store, selectedPadId);
  if (!pad) return { start: -1, end: -1 };
  return getPadStartAndEndTime(pad);
};

export const getPadsWithMedia = (store: StoreType) => {
  const { pads } = store.getSnapshot().context;
  return pads.filter((pad) => getPadSourceUrl(pad));
};

export const getAllMedia = (store: StoreType) => {
  const padsWithMedia = getPadsWithMedia(store);
  return padsWithMedia.map((pad) => getPadSourceUrl(pad));
};

export const useEditActive = () => {
  const { store } = useStore();

  const setEditActive = useCallback(
    (isEditActive: boolean) => {
      store.send({ type: 'setEditActive', isEditActive });
    },
    [store]
  );

  const isEditActive = useSelector(
    store,
    (state) => state.context.isEditActive
  );

  return { isEditActive, setEditActive };
};

/**
 * A hook that returns the selected pad id and a function to set the selected pad id
 * @returns
 */
export const useSelectedPadId = () => {
  const { store } = useStore();

  const setSelectedPadId = useCallback(
    (padId: string | null) => {
      store.send({ type: 'setSelectedPadId', padId });
    },
    [store]
  );

  const selectedPadId = useSelector(
    store,
    (state) => state.context.selectedPadId
  );

  return { selectedPadId, setSelectedPadId };
};

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

  const isLooped = pad?.isLooped;
  const isPadOneShot = pad?.isOneShot;

  return {
    isLooped,
    isPadOneShot,
    pad,
    selectedPadId,
    setPadIsOneShot,
    setPadIsLooped,
    store
  };
};
