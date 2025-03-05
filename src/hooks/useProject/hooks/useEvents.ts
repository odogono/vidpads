import { useCallback, useEffect } from 'react';

// import { createLog } from '@helpers/log';
import { useEvents as useGlobalEvents } from '@hooks/events';
import {
  PadIsLoopedEvent,
  PadIsOneShotEvent,
  ProjectStoreType
} from '@model/store/types';
import { useSelector } from '@xstate/store/react';

// const log = createLog('useProject/events');

export const useEvents = (project: ProjectStoreType) => {
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
        // log.debug('handleToggleLoop', { value });
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

  const handlePadIsLooped = useCallback(
    ({ padId, isLooped, url }: PadIsLoopedEvent) => {
      // log.debug('handlePadIsLooped', { padId, isLooped, url });
      events.emit('player:update', {
        url,
        padId,
        isLoop: isLooped
      });
    },
    [events]
  );

  const handlePadIsOneShot = useCallback(
    ({ padId, isOneShot, url }: PadIsOneShotEvent) => {
      if (!isOneShot) {
        events.emit('video:stop', { url, padId, time: 0 });
      }
    },
    [events]
  );

  useEffect(() => {
    const evtPadLooped = project.on('padIsLooped', handlePadIsLooped);
    const evtPadOneShot = project.on('padIsOneShot', handlePadIsOneShot);

    events.on('control:one-shot', handleToggleOneShot);
    events.on('control:loop', handleToggleLoop);
    events.on('control:resume', handleToggleResume);

    return () => {
      events.off('control:one-shot', handleToggleOneShot);
      events.off('control:loop', handleToggleLoop);
      events.off('control:resume', handleToggleResume);
      evtPadLooped.unsubscribe();
      evtPadOneShot.unsubscribe();
    };
  }, [
    events,
    handleToggleLoop,
    handleToggleOneShot,
    handleToggleResume,
    handlePadIsLooped,
    project
  ]);

  return events;
};
