'use client';

import { useCallback } from 'react';

import { useSelector } from '@xstate/store/react';
import { getPadSourceUrl } from '../pad';
import { Pad } from '../types';
import { StoreType } from './types';
import { useStore } from './useStore';

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

export const getPadsWithMedia = (store: StoreType) => {
  const { pads } = store.getSnapshot().context;
  return pads.filter((pad) => getPadSourceUrl(pad));
};

export const getAllMedia = (store: StoreType) => {
  const padsWithMedia = getPadsWithMedia(store);
  return padsWithMedia.map((pad) => getPadSourceUrl(pad));
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

export const useLastMediaUrl = () => {
  const { store } = useStore();
  const lastMediaUrl = useSelector(
    store,
    (state) => state.context.lastMediaUrl
  );

  const setLastMediaUrl = useCallback(
    (url: string) => {
      store.send({ type: 'setLastMediaUrl', url });
    },
    [store]
  );
  return { lastMediaUrl, setLastMediaUrl };
};

export const useLastImportUrl = () => {
  const { store } = useStore();
  const lastImportUrl = useSelector(
    store,
    (state) => state.context.lastImportUrl
  );

  const setLastImportUrl = useCallback(
    (url: string) => {
      store.send({ type: 'setLastImportUrl', url });
    },
    [store]
  );
  return { lastImportUrl, setLastImportUrl };
};
