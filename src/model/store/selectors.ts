'use client';

import { useCallback } from 'react';

import { useProject } from '@hooks/useProject';
import { useSelector } from '@xstate/store/react';
import { getPadSourceUrl } from '../pad';
import { Pad } from '../types';
import { StoreType } from './types';

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
  const { project } = useProject();

  const setSelectedPadId = useCallback(
    (padId: string | null) => {
      project.send({ type: 'setSelectedPadId', padId });
    },
    [project]
  );

  const selectedPadId = useSelector(
    project,
    (state) => state.context.selectedPadId
  );

  return { selectedPadId, setSelectedPadId };
};

export const useLastMediaUrl = () => {
  const { project } = useProject();
  const lastMediaUrl = useSelector(
    project,
    (state) => state.context.lastMediaUrl
  );

  const setLastMediaUrl = useCallback(
    (url: string) => {
      project.send({ type: 'setLastMediaUrl', url });
    },
    [project]
  );
  return { lastMediaUrl, setLastMediaUrl };
};

export const useLastImportUrl = () => {
  const { project } = useProject();
  const lastImportUrl = useSelector(
    project,
    (state) => state.context.lastImportUrl
  );

  const setLastImportUrl = useCallback(
    (url: string) => {
      project.send({ type: 'setLastImportUrl', url });
    },
    [project]
  );
  return { lastImportUrl, setLastImportUrl };
};
