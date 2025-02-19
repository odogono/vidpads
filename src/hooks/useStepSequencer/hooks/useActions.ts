import { useCallback } from 'react';

import { createLog } from '@helpers/log';
import { useProject } from '@hooks/useProject';

// import { SequencerEvent } from '@model/types';

const log = createLog('timeSeq/useActions');

export const useActions = ({
  isPlaying,
  isRecording
}: {
  isPlaying: boolean;
  isRecording: boolean;
}) => {
  const { project } = useProject();

  const play = useCallback(() => {
    log.debug('play');
    project.send({
      type: 'startSequencer',
      isPlaying: true,
      isRecording: false,
      mode: 'step'
    });
  }, [project]);

  const playToggle = useCallback(() => {
    if (isPlaying || isRecording) {
      project.send({ type: 'stopSequencer', mode: 'step' });
    } else {
      project.send({
        type: 'startSequencer',
        isPlaying: true,
        isRecording: false,
        mode: 'step'
      });
    }
  }, [project, isPlaying, isRecording]);

  const stop = useCallback(() => {
    log.debug('stop');
    project.send({ type: 'stopSequencer', mode: 'step' });
  }, [project]);

  const setBpm = useCallback(
    (bpm: number) => {
      project.send({ type: 'setSequencerBpm', bpm, mode: 'step' });
    },
    [project]
  );

  const record = useCallback(() => {
    project.send({
      type: 'startSequencer',
      isPlaying: false,
      isRecording: true,
      mode: 'step'
    });
  }, [project]);

  const rewind = useCallback(() => {
    project.send({ type: 'rewindSequencer', mode: 'step' });
  }, [project]);

  const toggleStep = useCallback(
    (padId: string, step: number) => {
      project.send({
        type: 'toggleStepSequencerEvent',
        padId,
        step,
        patternIndex: 0
      });
    },
    [project]
  );

  const clearEvents = useCallback(() => {
    project.send({ type: 'clearSequencerEvents', mode: 'step' });
  }, [project]);

  return {
    isPlaying,
    isRecording,
    play,
    playToggle,
    stop,
    record,
    rewind,
    setBpm,
    toggleStep,
    clearEvents
  };
};
