import { useCallback } from 'react';

import { useSelector } from '@xstate/store/react';
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

  return pads.filter((pad) => pad.pipeline.source?.url === sourceUrl);
};

export const getPadsWithMedia = (store: StoreType) => {
  const { pads } = store.getSnapshot().context;
  return pads.filter((pad) => pad.pipeline.source?.url);
};

export const getAllMedia = (store: StoreType) => {
  const padsWithMedia = getPadsWithMedia(store);
  return padsWithMedia.map((pad) => pad.pipeline.source?.url);
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

export const useSelectedPad = () => {
  const { store } = useStore();
  const pads = useSelector(store, (state) => state.context.pads) ?? [];
  const selectedPadId = useSelector(
    store,
    (state) => state.context.selectedPadId
  );
  const isPadOneShot = useSelector(
    store,
    (state) =>
      state.context.pads.find((pad) => pad.id === selectedPadId)?.isOneShot
  );

  const setPadIsOneShot = useCallback(
    (padId: string, isOneShot: boolean) => {
      store.send({ type: 'setPadIsOneShot', padId, isOneShot });
    },
    [store]
  );

  const pad = pads.find((pad) => pad.id === selectedPadId);
  return { isPadOneShot, pad, setPadIsOneShot };
};
