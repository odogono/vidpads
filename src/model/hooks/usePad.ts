'use client';

import { useCallback } from 'react';

import { useProject } from '@hooks/useProject';
import { useSelector } from '@xstate/store/react';
import { getPadIsOneShot, getPadLabel, getPadSourceUrl } from '../pad';

export type UsePadResult = ReturnType<typeof usePad>;

/**
 * A hook that returns either the pad specified by the
 * padId or the currently selected pad
 *
 * @param padId
 * @returns
 */
export const usePad = (padId?: string) => {
  const { project } = useProject();

  const selectedPadId = useSelector(
    project,
    (state) => state.context.selectedPadId
  );

  if (!padId && selectedPadId) {
    padId = selectedPadId;
  }

  const pad = useSelector(project, (state) =>
    state.context.pads.find((pad) => pad.id === padId)
  );

  const isPadPlayEnabled = useSelector(
    project,
    (state) => state.context.isPadPlayEnabled ?? true
  );

  const isPadSelectSourceEnabled = useSelector(
    project,
    (state) => state.context.isPadSelectSourceEnabled ?? true
  );

  const setPadPlayEnabled = useCallback(
    (isEnabled: boolean) => {
      project.send({ type: 'setPadPlayEnabled', isEnabled });
    },
    [project]
  );

  const setPadSelectSourceEnabled = useCallback(
    (isEnabled: boolean) => {
      project.send({ type: 'setPadSelectSourceEnabled', isEnabled });
    },
    [project]
  );

  const setPadIsOneShot = useCallback(
    (padId: string, isOneShot: boolean) => {
      if (pad) {
        project.send({ type: 'setPadIsOneShot', padId, isOneShot });
      }
    },
    [pad, project]
  );

  const setPadIsLooped = useCallback(
    (padId: string, isLooped: boolean) => {
      if (pad) {
        project.send({
          type: 'applyLoopToPad',
          padId,
          start: isLooped ? 0 : -1
        });
      }
    },
    [pad, project]
  );

  const setPadVolume = useCallback(
    (padId: string, volume: number) => {
      if (pad) {
        project.send({ type: 'applyVolumeToPad', padId, volume });
      }
    },
    [pad, project]
  );

  const setPadPlaybackRate = useCallback(
    (padId: string, rate: number) => {
      if (pad) {
        project.send({ type: 'applyPlaybackRateToPad', padId, rate });
      }
    },
    [pad, project]
  );

  const setPadLabel = useCallback(
    (label: string) => {
      if (pad) {
        project.send({ type: 'setPadLabel', padId: pad.id, label });
      }
    },
    [pad, project]
  );

  const isPadAssigned = !!getPadSourceUrl(pad);

  const padLabel = getPadLabel(pad);

  const isPadOneShot = getPadIsOneShot(pad);

  return {
    isPadOneShot,
    isPadPlayEnabled,
    isPadSelectSourceEnabled,
    isPadAssigned,
    pad,
    selectedPadId,
    setPadIsOneShot,
    setPadIsLooped,
    setPadVolume,
    setPadPlaybackRate,
    setPadPlayEnabled,
    setPadSelectSourceEnabled,
    project,
    padLabel,
    setPadLabel
  };
};
