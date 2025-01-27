'use client';

import { useCallback, useMemo } from 'react';

import { createLog } from '@helpers/log';
import { getPadInterval, getPadSourceUrl } from '@model/pad';
import { useStore } from '@model/store/useStore';
import { useSelector } from '@xstate/store/react';
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

  const setSelectedPadId = useCallback(
    (padId: string | null) => {
      store.send({ type: 'setSelectedPadId', padId });
    },
    [store]
  );

  return {
    pads,
    isReady,
    selectedPadId,
    isPadPlayEnabled,
    isPadSelectSourceEnabled,
    setSelectedPadId
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

export const usePadDetails = (padId: string) => {
  const { store } = useStore();

  // const getPadIntervalQuery = useQuery({
  //   queryKey: VOKeys.padInterval(padId),
  //   queryFn: () => getPadIntervalInternal(padId)
  // });

  // todo - use query
  const getPadIntervalInternal = useCallback((): Interval | undefined => {
    const pad = store
      .getSnapshot()
      .context.pads.find((pad) => pad.id === padId);
    if (!pad) {
      log.debug('getPadInterval', padId, 'not found');
      return undefined;
    }
    return getPadInterval(pad, { start: 0, end: -1 });
  }, [padId, store]);

  return {
    getPadInterval: getPadIntervalInternal
  };
};
