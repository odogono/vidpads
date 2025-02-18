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
      isRecording: false
    });
  }, [project]);

  const playToggle = useCallback(() => {
    if (isPlaying || isRecording) {
      project.send({ type: 'stopSequencer' });
    } else {
      project.send({
        type: 'startSequencer',
        isPlaying: true,
        isRecording: false
      });
    }
  }, [project, isPlaying, isRecording]);

  const stop = useCallback(() => {
    log.debug('stop');
    project.send({ type: 'stopSequencer' });
  }, [project]);

  const setBpm = useCallback(
    (bpm: number) => {
      project.send({ type: 'setSequencerBpm', bpm, isStep: true });
    },
    [project]
  );

  const record = useCallback(() => {
    project.send({
      type: 'startSequencer',
      isPlaying: false,
      isRecording: true
    });
  }, [project]);

  const rewind = useCallback(() => {
    project.send({ type: 'rewindSequencer' });
  }, [project]);

  return {
    isPlaying,
    isRecording,
    play,
    playToggle,
    stop,
    record,
    rewind,
    setBpm
  };
};
