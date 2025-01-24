'use client';

import { useCallback, useMemo } from 'react';

import { createLog } from '@helpers/log';
import { useStore } from '@model/store/useStore';
import { useSelector } from '@xstate/store/react';
import { getPadInterval, getPadSourceUrl } from '../pad';
import { Interval } from '../types';
import { useMetadata } from './useMetadata';

const log = createLog('model/usePads');

export const usePads = () => {
  const { store, isReady } = useStore();
  const pads = useSelector(store, (state) => state.context.pads) ?? [];
  const isPadPlayEnabled = useSelector(
    store,
    (state) => state.context.isPadPlayEnabled ?? true
  );
  const isPadSelectSourceEnabled = useSelector(
    store,
    (state) => state.context.isPadSelectSourceEnabled ?? true
  );
  const selectedPadId = useSelector(
    store,
    (state) => state.context.selectedPadId
  );
  return {
    pads,
    isReady,
    selectedPadId,
    isPadPlayEnabled,
    isPadSelectSourceEnabled
  };
};

export const usePadsExtended = () => {
  const { pads, isReady, selectedPadId } = usePads();
  const { urlToMetadata } = useMetadata();

  const { selectedPadSourceUrl, selectedPadStartAndEndTime } = useMemo(() => {
    const selectedPad = pads.find((pad) => pad.id === selectedPadId);
    const selectedPadSourceUrl = selectedPad
      ? getPadSourceUrl(selectedPad)
      : null;
    const selectedPadStartAndEndTime = selectedPad
      ? getPadInterval(selectedPad)
      : null;
    return { selectedPad, selectedPadSourceUrl, selectedPadStartAndEndTime };
  }, [pads, selectedPadId]);

  const padsWithMedia = useMemo(
    () => pads.filter((pad) => getPadSourceUrl(pad)),
    [pads]
  );

  return {
    isReady,
    pads,
    // padSourceUrls,
    padsWithMedia,
    selectedPadSourceUrl,
    selectedPadStartAndEndTime,
    urlToMetadata
    // mediaIntervals
  };
};

export const usePadDetails = () => {
  const { store } = useStore();

  const getPadInterval = useCallback(
    (padId: string): Interval | undefined => {
      const pad = store
        .getSnapshot()
        .context.pads.find((pad) => pad.id === padId);
      if (!pad) {
        log.debug('getPadInterval', padId, 'not found');
        return undefined;
      }
      return getPadInterval(pad, { start: 0, end: -1 });
    },
    [store]
  );

  return {
    getPadInterval
  };
};
