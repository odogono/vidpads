import { useCallback } from 'react';

import { useEvents } from '@hooks/events';
// import { createLog } from '@helpers/log';
import { useProject } from '@hooks/useProject';
import { useSelector } from '@xstate/store/react';
import { getIntersectingEvents } from '../sequencerEvent';
import { SequencerEvent } from '../types';

// const log = createLog('sequencer/useSequencer');

/**
 * Interface from the state store to the sequencer
 * @returns
 */
export const useSequencer = () => {
  const { project } = useProject();
  const events = useEvents();

  const time =
    useSelector(project, (state) => state.context.sequencer?.time) ?? 0;
  const endTime =
    useSelector(project, (state) => state.context.sequencer?.endTime) ?? 30;

  const setTime = useCallback(
    (time: number) => project.send({ type: 'setSequencerTime', time }),
    [project]
  );

  const setEndTime = useCallback(
    (endTime: number) => project.send({ type: 'setSequencerEndTime', endTime }),
    [project]
  );

  const play = useCallback(() => {
    events.emit('seq:play');
  }, [events]);

  const record = useCallback(() => {
    events.emit('seq:record');
  }, [events]);

  const stop = useCallback(() => {
    events.emit('seq:stop', {
      time: performance.now()
    });
  }, [events]);

  const rewind = useCallback(() => {
    events.emit('seq:rewind');
  }, [events]);

  const bpm = useSelector(
    project,
    (state) => state.context.sequencer?.bpm ?? 120
  );

  const evtStr = (e: SequencerEvent) =>
    `${e.padId}-${e.id}-${e.time}-${e.duration}-${e.isSelected ? 's' : ''}`;

  const seqEvents = useSelector(
    project,
    (state) => state.context.sequencer?.events
  );

  const seqSelectedEvents = seqEvents.filter((e) => e.isSelected);
  const seqSelectedEventIds = seqSelectedEvents.map((e) => evtStr(e)).join(',');
  const seqEventIds = seqEvents.map((e) => evtStr(e)).join(',');

  const setBpm = useCallback(
    (bpm: number) => {
      project.send({ type: 'setSequencerBpm', bpm });
    },
    [project]
  );

  const timeToStep = useCallback(
    (time: number) => {
      const beatLength = 60000 / bpm;
      const stepPosition = (time / beatLength) * 4;
      return stepPosition;
    },
    [bpm]
  );
  const stepToTime = useCallback(
    (step: number) => {
      const beatLength = 60000 / bpm;
      const stepLength = beatLength / 4;
      const time = step * stepLength;
      return time;
    },
    [bpm]
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
    project.send({ type: 'clearSequencerEvents' });
  }, [project]);

  const addEvent = useCallback(
    (padId: string, time: number, duration: number) => {
      project.send({ type: 'addSequencerEvent', padId, time, duration });
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
        padIds: evts.map((e) => e.padId),
        time: evts[0].time,
        duration: evts[0].duration
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
      project.send({ type: 'setSelectedEventsTime', time });
    },
    [project]
  );

  const setSelectedEventsDuration = useCallback(
    (duration: number) => {
      project.send({ type: 'setSelectedEventsDuration', duration });
    },
    [project]
  );

  const getEventsAtTime = useCallback(
    (padId: string, time: number) =>
      getIntersectingEvents(seqEvents, time, 0.001, [padId]),
    [seqEvents]
  );

  return {
    play,
    record,
    stop,
    rewind,
    bpm,
    seqEvents,
    seqEventIds,
    seqSelectedEvents,
    seqSelectedEventIds,
    setBpm,
    toggleEvent,
    stepToTime,
    timeToStep,
    clearEvents,
    addEvent,
    removeEvent,
    selectEventsAtTime,
    selectEvents,
    moveEvents,
    time,
    endTime,
    setTime,
    setEndTime,
    setSelectedEventsTime,
    setSelectedEventsDuration,
    getEventsAtTime
  };
};
