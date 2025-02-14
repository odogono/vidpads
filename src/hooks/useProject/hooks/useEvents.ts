import { useCallback, useEffect } from 'react';

import { useEvents as useGlobalEvents } from '@hooks/events';
import { StoreType } from '@model/store/types';
import { useSelector } from '@xstate/store/react';

export const useEvents = (project: StoreType) => {
  const events = useGlobalEvents();

  const selectedPadId = useSelector(
    project,
    (state) => state.context.selectedPadId
  );

  const handleToggleOneShot = useCallback(
    (value: boolean | undefined) => {
      if (selectedPadId) {
        project.send({
          type: 'setPadIsOneShot',
          padId: selectedPadId,
          isOneShot: value
        });
      }
    },
    [project, selectedPadId]
  );

  const handleToggleLoop = useCallback(
    (value: boolean | undefined) => {
      if (selectedPadId) {
        project.send({
          type: 'setPadIsLooped',
          padId: selectedPadId,
          isLooped: value
        });
      }
    },
    [project, selectedPadId]
  );

  const handleToggleResume = useCallback(
    (value: boolean | undefined) => {
      if (selectedPadId) {
        project.send({
          type: 'setPadPlaybackResume',
          padId: selectedPadId,
          isResume: value
        });
      }
    },
    [project, selectedPadId]
  );

  useEffect(() => {
    events.on('control:one-shot', handleToggleOneShot);
    events.on('control:loop', handleToggleLoop);
    events.on('control:resume', handleToggleResume);

    return () => {
      events.off('control:one-shot', handleToggleOneShot);
      events.off('control:loop', handleToggleLoop);
      events.off('control:resume', handleToggleResume);
    };
  }, [events, handleToggleLoop, handleToggleOneShot, handleToggleResume]);

  return events;
};
