'use client';

import { useCallback } from 'react';

import { useProject } from '@hooks/useProject';
import { useSelector } from '@xstate/store/react';
import {
  getPadChokeGroup,
  getPadIsOneShot,
  getPadLabel,
  getPadPlayPriority,
  getPadPlaybackResume,
  getPadSourceUrl
} from '../pad';

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

  const setPadIsLooped = useCallback(
    (padId: string, isLooped: boolean) => {
      if (pad) {
        project.send({
          type: 'setPadIsLooped',
          padId,
          isLooped
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

  const setPadChokeGroup = useCallback(
    (chokeGroup: number | undefined) => {
      if (pad) {
        project.send({
          type: 'setPadChokeGroup',
          padId: pad.id,
          group: chokeGroup
        });
      }
    },
    [pad, project]
  );

  const setPadPlayPriority = useCallback(
    (playPriority: number | undefined) => {
      if (pad) {
        project.send({
          type: 'setPadPlayPriority',
          padId: pad.id,
          priority: playPriority
        });
      }
    },
    [pad, project]
  );

  const isPadAssigned = !!getPadSourceUrl(pad);

  const padLabel = getPadLabel(pad);

  const isPadOneShot = getPadIsOneShot(pad);

  const chokeGroup = getPadChokeGroup(pad);
  const playPriority = getPadPlayPriority(pad);

  const isResume = getPadPlaybackResume(pad);

  return {
    isPadOneShot,
    chokeGroup,
    playPriority,
    isPadAssigned,
    pad,
    selectedPadId,
    setPadIsLooped,
    setPadVolume,
    setPadPlaybackRate,
    project,
    padLabel,
    setPadLabel,
    setPadChokeGroup,
    setPadPlayPriority,
    isResume
  };
};
