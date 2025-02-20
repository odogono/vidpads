'use client';

import { useCallback } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { useProject } from '@hooks/useProject';
import { Pad } from '@model/types';

const log = createLog('stepSeq/usePadStepEvents', ['debug']);

export const usePadStepEvents = () => {
  const { project } = useProject();
  const events = useEvents();

  const handlePadTouchStart = useCallback(
    (pad: Pad, step: number) => {
      log.debug('handlePadTouchStart', { pad, step });
      events.emit('pad:touchdown', { padId: pad.id, source: 'step-seq' });
    },
    [events]
  );

  const handlePadTouchEnd = useCallback(
    (pad: Pad, step: number) => {
      log.debug('handlePadTouchEnd', { pad, step });
      events.emit('pad:touchup', { padId: pad.id, source: 'step-seq' });
      project.send({
        type: 'toggleStepSequencerEvent',
        padId: pad.id,
        step
      });
    },
    [events, project]
  );

  const handlePadEnter = useCallback(
    (pad: Pad, step: number) => {
      log.debug('handlePadEnter', { pad, step });
      events.emit('pad:enter', {
        padId: pad.id,
        source: 'step-seq',
        index: step
      });
    },
    [events]
  );

  const handlePadLeave = useCallback(
    (pad: Pad, step: number) => {
      log.debug('handlePadLeave', { pad, step });
      events.emit('pad:leave', {
        padId: pad.id,
        source: 'step-seq',
        index: step
      });
    },
    [events]
  );

  return {
    handlePadTouchStart,
    handlePadTouchEnd,
    handlePadEnter,
    handlePadLeave
  };
};
