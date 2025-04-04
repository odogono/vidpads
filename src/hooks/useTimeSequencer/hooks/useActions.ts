import { useCallback } from 'react';

import { createLog } from '@helpers/log';
import { useProject } from '@hooks/useProject';
import { SequencerEvent } from '@model/types';

const log = createLog('timeSeq/useActions', ['debug']);

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
      mode: 'time'
    });
  }, [project]);

  const playToggle = useCallback(() => {
    if (isPlaying || isRecording) {
      project.send({ type: 'stopSequencer', mode: 'time' });
    } else {
      project.send({
        type: 'startSequencer',
        isPlaying: true,
        isRecording: false,
        mode: 'time'
      });
    }
  }, [project, isPlaying, isRecording]);

  const stop = useCallback(() => {
    log.debug('stop');
    project.send({ type: 'stopSequencer', mode: 'time' });
  }, [project]);

  const record = useCallback(() => {
    project.send({
      type: 'startSequencer',
      isPlaying: false,
      isRecording: true,
      mode: 'time'
    });
  }, [project]);

  const rewind = useCallback(() => {
    project.send({ type: 'rewindSequencer', mode: 'time' });
  }, [project]);

  const setEndTime = useCallback(
    (endTime: number) => {
      project.send({ type: 'setSequencerEndTime', endTime, mode: 'time' });
    },
    [project]
  );

  const setTime = useCallback(
    (time: number) => {
      project.send({ type: 'setSequencerTime', time, mode: 'time' });
    },
    [project]
  );

  const setLooped = useCallback(
    (isLooped: boolean) => {
      log.debug('setLooped', { isLooped });
      project.send({ type: 'setSequencerIsLooped', isLooped, mode: 'time' });
    },
    [project]
  );

  const setSequencerTimes = useCallback(
    (time: number, endTime: number) => {
      project.send({ type: 'setSequencerTime', time, mode: 'time' });
      project.send({ type: 'setSequencerEndTime', endTime, mode: 'time' });
    },
    [project]
  );

  const setBpm = useCallback(
    (bpm: number) => {
      project.send({ type: 'setSequencerBpm', bpm, mode: 'time' });
    },
    [project]
  );

  const toggleEvent = useCallback(
    (padId: string, startTime: number, endTime: number) => {
      project.send({
        type: 'toggleSequencerEvent',
        padId,
        time: startTime,
        duration: endTime - startTime
      });
    },
    [project]
  );

  const clearEvents = useCallback(() => {
    project.send({ type: 'clearSequencerEvents', mode: 'time' });
  }, [project]);

  const addEvent = useCallback(
    (evt: SequencerEvent) => {
      project.send({ type: 'addSequencerEvent', evt });
    },
    [project]
  );

  const removeEvent = useCallback(
    (padId: string, time: number) => {
      project.send({ type: 'removeSequencerEvent', padId, time });
    },
    [project]
  );

  const selectEvents = useCallback(
    (evts: SequencerEvent[]) => {
      project.send({
        type: 'selectSequencerEvents',
        evtIds: evts.map((e) => e.id),
        padIds: [],
        time: 0,
        duration: 0
      });
    },
    [project]
  );

  const selectEventsAtTime = useCallback(
    (padIds: string[], time: number, duration: number) => {
      project.send({ type: 'selectSequencerEvents', padIds, time, duration });
    },
    [project]
  );

  const moveEvents = useCallback(
    (timeDelta: number, rowDelta: number, isFinished?: boolean) => {
      // log.debug('[moveEvents]', { timeDelta, rowDelta, isFinished });
      project.send({
        type: 'moveSequencerEvents',
        timeDelta,
        rowDelta,
        isFinished
      });
    },
    [project]
  );

  const setSelectedEventsTime = useCallback(
    (time: number) => {
      project.send({ type: 'setSelectedEventsTime', time, mode: 'time' });
    },
    [project]
  );

  const setSelectedEventsDuration = useCallback(
    (duration: number) => {
      project.send({
        type: 'setSelectedEventsDuration',
        duration,
        mode: 'time'
      });
    },
    [project]
  );

  const cutEvents = useCallback(
    () => project.send({ type: 'clipboardSequencerEvents', op: 'cut' }),
    [project]
  );
  const copyEvents = useCallback(
    () => project.send({ type: 'clipboardSequencerEvents', op: 'copy' }),
    [project]
  );

  const repeatEvents = useCallback(
    () => project.send({ type: 'repeatSequencerEvents' }),
    [project]
  );

  const pasteEvents = useCallback(
    (fromTime: number, fromPadId: string) => {
      project.send({
        type: 'clipboardSequencerEvents',
        op: 'paste',
        time: fromTime,
        padId: fromPadId
      });
    },
    [project]
  );

  const snapEvents = useCallback(() => {
    project.send({ type: 'snapSequencerEvents', step: 1 });
  }, [project]);

  return {
    isPlaying,
    isRecording,
    play,
    playToggle,
    stop,
    record,
    rewind,
    setEndTime,
    setTime,
    setLooped,
    setSequencerTimes,
    setBpm,
    toggleEvent,
    clearEvents,
    addEvent,
    removeEvent,
    selectEvents,
    selectEventsAtTime,
    moveEvents,
    setSelectedEventsTime,
    setSelectedEventsDuration,
    repeatEvents,
    cutEvents,
    copyEvents,
    pasteEvents,
    snapEvents
  };
};
