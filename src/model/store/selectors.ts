import { useSelector } from '@xstate/store/react';
import { Pad } from '../types';
import { StoreType } from './types';
import { useStore } from './useStore';

export const usePads = () => {
  const store = useStore();
  const pads = useSelector(store, (state) => state.context.pads) ?? [];

  // Sort pads using natural sort to handle numbers correctly
  const sortedPads = pads.sort((a, b) => {
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  return { pads: sortedPads, store };
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
