'use client';

import { useMemo } from 'react';

import { createLog } from '@helpers/log';
import { useStore } from '@model/store/useStore';
import { useSelector } from '@xstate/store/react';
import { useRenderingTrace } from '../../hooks/useRenderingTrace';
import { getPadSourceUrl, getPadStartAndEndTime } from '../pad';

const log = createLog('model/usePads');

export const usePads = () => {
  const { store, isReady } = useStore();
  const pads = useSelector(store, (state) => state.context.pads) ?? [];
  const selectedPadId = useSelector(
    store,
    (state) => state.context.selectedPadId
  );
  return { pads, isReady, selectedPadId };
};

export const usePadsExtended = () => {
  const { pads, isReady, selectedPadId } = usePads();

  const { selectedPadSourceUrl, selectedPadStartAndEndTime } = useMemo(() => {
    const selectedPad = pads.find((pad) => pad.id === selectedPadId);
    const selectedPadSourceUrl = selectedPad
      ? getPadSourceUrl(selectedPad)
      : null;
    const selectedPadStartAndEndTime = selectedPad
      ? getPadStartAndEndTime(selectedPad)
      : null;
    return { selectedPad, selectedPadSourceUrl, selectedPadStartAndEndTime };
  }, [pads, selectedPadId]);

  // Sort pads using natural sort to handle numbers correctly
  const sortedPads = pads.sort((a, b) => {
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  const padsWithMedia = useMemo(
    () => sortedPads.filter((pad) => getPadSourceUrl(pad)),
    [sortedPads]
  );

  const padSourceUrls = useMemo(
    () =>
      Array.from(
        new Set(
          padsWithMedia
            .map((pad) => getPadSourceUrl(pad))
            .filter(Boolean) as string[]
        )
      ),
    [padsWithMedia]
  );

  useRenderingTrace('usePads', {
    pads,
    selectedPadId,
    padSourceUrls,
    padsWithMedia,
    selectedPadSourceUrl,
    selectedPadStartAndEndTime
  });

  return {
    isReady,
    pads: sortedPads,
    padSourceUrls,
    padsWithMedia,
    selectedPadSourceUrl,
    selectedPadStartAndEndTime
  };
};
