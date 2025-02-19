'use client';

import { useCallback } from 'react';

import { useProject } from '@hooks/useProject';
import { getPadSourceUrl } from '@model/pad';
import { ProjectStoreType } from '@model/store/types';
import { Pad } from '@model/types';
import { useSelector } from '@xstate/store/react';

export const getPadById = (
  store: ProjectStoreType,
  padId: string
): Pad | undefined => {
  const { pads } = store.getSnapshot().context;
  return pads.find((pad) => pad.id === padId);
};

export const getPadsBySourceUrl = (
  store: ProjectStoreType,
  sourceUrl: string
): Pad[] => {
  const { pads } = store.getSnapshot().context;
  return pads.filter((pad) => getPadSourceUrl(pad) === sourceUrl);
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

export const useProjectUpdatedAt = () => {
  const { project } = useProject();
  return useSelector(project, (state) => state.context.updatedAt);
};
