import { useCallback } from 'react';

import { readFromClipboard, writeToClipboard } from '@helpers/clipboard';
import { createLog } from '@helpers/log';
import { showSuccess } from '@helpers/toast';
import { useProject } from '@hooks/useProject';
import {
  createStepSequencerPatternUrl,
  parseStepSequencerPatternUrl
} from '../helpers';
import { UseSelectorsResult } from './useSelectors';

const log = createLog('stepSeq/useActions', ['debug']);

interface UseActionsProps extends UseSelectorsResult {
  isPlaying: boolean;
  isRecording: boolean;
}

export const useActions = ({
  isPlaying,
  isRecording,
  patternIndex,
  pattern,
  patternStr
}: UseActionsProps) => {
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
        step
      });
    },
    [project]
  );

  const clearEvents = useCallback(() => {
    project.send({ type: 'clearSequencerEvents', mode: 'step' });
  }, [project]);

  const setPatternIndex = useCallback(
    (index: number) => {
      project.send({
        type: 'setStepSequencerPatternIndex',
        index
      });
    },
    [project]
  );

  const deletePattern = useCallback(() => {
    project.send({ type: 'deleteStepSequencerPattern', index: patternIndex });
  }, [project, patternIndex]);

  const addPattern = useCallback(
    (copyFromCurrent: boolean = false) => {
      project.send({
        type: 'addStepSequencerPattern',
        copy: copyFromCurrent,
        setIndex: true
      });
    },
    [project]
  );

  const copyPatternToClipboard = useCallback(async () => {
    const url = createStepSequencerPatternUrl(pattern);
    await writeToClipboard(url);
    showSuccess(`Copied pattern ${patternIndex + 1} to clipboard`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, patternIndex, patternStr]);

  const cutPatternToClipboard = useCallback(async () => {
    const url = createStepSequencerPatternUrl(pattern);
    await writeToClipboard(url);

    project.send({
      type: 'deleteStepSequencerPattern',
      index: patternIndex
    });

    showSuccess(`Cut pattern ${patternIndex + 1} to clipboard`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, patternStr, patternIndex]);

  const pastePatternFromClipboard = useCallback(async () => {
    const clipboard = await readFromClipboard();
    const pattern = parseStepSequencerPatternUrl(clipboard);
    if (!pattern) return;

    project.send({
      type: 'setStepSequencerPattern',
      index: patternIndex,
      pattern
    });
  }, [project, patternIndex]);

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
    clearEvents,
    setPatternIndex,
    deletePattern,
    addPattern,
    copyPatternToClipboard,
    cutPatternToClipboard,
    pastePatternFromClipboard
  };
};
