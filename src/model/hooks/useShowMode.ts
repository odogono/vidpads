'use client';

import { useCallback } from 'react';

import { useProject } from '@hooks/useProject';
import type { ShowMode } from '@model/types';
import { useSelector } from '@xstate/store/react';

export const useShowMode = () => {
  const { project } = useProject();
  const showMode = useSelector(project, (state) => state.context.showMode);

  const setShowMode = useCallback(
    (mode: ShowMode) => {
      project.send({ type: 'setShowMode', mode });
    },
    [project]
  );

  const isPadsVisible = !showMode || showMode === 'pads';
  const isSequencerVisible = showMode === 'sequencer';

  return {
    isPadsVisible,
    isSequencerVisible,
    showMode,
    setShowMode
  };
};
