import { useSelector } from '@xstate/store/react';
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
