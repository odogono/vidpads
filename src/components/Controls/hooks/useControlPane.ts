'use client';

import { useCallback } from 'react';

import { useProject } from '@hooks/useProject';
import { ControlPanes } from '@types';
import { useSelector } from '@xstate/store/react';

const ControlPaneIndexes: ControlPanes[] = [
  'state',
  'interval',
  'details',
  'sequencer'
];

export const useControlPane = () => {
  const { project } = useProject();

  const selectedControlPane = useSelector(
    project,
    (state) => state.context.selectedControlPane ?? 'state'
  );

  const setSelectedControlPane = useCallback(
    (pane: ControlPanes) => {
      project.send({ type: 'setSelectedControlPane', pane });
    },
    [project]
  );

  const goToPreviousControlPane = useCallback(() => {
    const index = ControlPaneIndexes.indexOf(selectedControlPane);
    const previousIndex = index - 1;
    const previousPane = ControlPaneIndexes[previousIndex];
    setSelectedControlPane(previousPane);
  }, [setSelectedControlPane, selectedControlPane]);

  const goToNextControlPane = useCallback(() => {
    const index = ControlPaneIndexes.indexOf(selectedControlPane);
    const nextIndex = index + 1;
    const nextPane = ControlPaneIndexes[nextIndex];
    setSelectedControlPane(nextPane);
  }, [setSelectedControlPane, selectedControlPane]);

  return {
    selectedControlPane,
    setSelectedControlPane,
    goToPreviousControlPane,
    goToNextControlPane
  };
};
