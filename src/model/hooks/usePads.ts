'use client';

import { useMemo } from 'react';

import { createLog } from '@helpers/log';
import { useStore } from '@model/store/useStore';
import { useSelector } from '@xstate/store/react';
import { getPadSourceUrl, getPadStartAndEndTime } from '../pad';
import { useMetadata } from './useMetadata';

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
  const { urlToMetadata } = useMetadata();

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
  // const sortedPads = pads.sort((a, b) => {
  //   return a.id.localeCompare(b.id, undefined, { numeric: true });
  // });

  const padsWithMedia = useMemo(
    () => pads.filter((pad) => getPadSourceUrl(pad)),
    [pads]
  );

  log.debug('[usePadsExtended] padsWithMedia:', padsWithMedia.length);

  // const padSourceUrls = useMemo(
  //   () =>
  //     Array.from(
  //       new Set(
  //         padsWithMedia
  //           .map((pad) => getPadSourceUrl(pad))
  //           .filter(Boolean) as string[]
  //       )
  //     ),
  //   [padsWithMedia]
  // );

  // for each media url, get a list of start and end times
  // const mediaIntervals = useMemo(() => {
  //   const urlToIntervals = padsWithMedia.reduce(
  //     (acc, pad) => {
  //       const url = getPadSourceUrl(pad);
  //       if (!url) return acc;
  //       let interval = getPadStartAndEndTime(pad);
  //       if (!interval) {
  //         const media = urlToMetadata?.get(url);
  //         if (!media) return acc;
  //         const { duration } = media;
  //         interval = { start: 0, end: duration };
  //       }
  //       const existing = acc[url] ?? new Set<string>();
  //       existing.add(JSON.stringify(interval));
  //       acc[url] = existing;
  //       return acc;
  //     },
  //     {} as { [key: string]: Set<string> }
  //   );

  //   const result = Object.entries(urlToIntervals).reduce(
  //     (acc, [url, intervals]) => {
  //       acc[url] = Array.from(intervals).map((str) => JSON.parse(str));
  //       return acc;
  //     },
  //     {} as { [key: string]: Interval[] }
  //   );

  //   return result;
  // }, [padsWithMedia, urlToMetadata]);

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
