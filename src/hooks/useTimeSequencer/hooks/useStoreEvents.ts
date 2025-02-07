import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { useProject } from '@hooks/useProject';
import { SequencerStartedEvent } from '@model/store/types';

const log = createLog('timeSeq/useStoreEvents');

interface UseStoreEventsProps {
  time: number;
  endTime: number;
  isLooped: boolean;
}

export const useStoreEvents = ({
  time,
  endTime,
  isLooped
}: UseStoreEventsProps) => {
  const { project } = useProject();
  const events = useEvents();
  const animationRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const playStartedAtRef = useRef<number>(0);
  const timeRef = useRef(time);

  const updateTime = useCallback(() => {
    // if (!isPlaying && !isRecording) {
    //   return;
    // }
    const now = performance.now();
    // const time = timeRef.current;
    const currentTime = time + (now - playStartedAtRef.current) / 1000;

    log.debug({
      time,
      currentTime,
      endTime,
      isLooped
    });

    events.emit('seq:time-update', {
      time: currentTime,
      endTime,
      isPlaying,
      isRecording
    });

    if (currentTime >= endTime) {
      if (isLooped) {
        project.send({ type: 'rewindSequencer' });
        timeRef.current = 0;
      } else {
        project.send({ type: 'stopSequencer' });
      }
    }

    // log.debug('updateTime', time);

    if (animationRef.current !== null) {
      animationRef.current = requestAnimationFrame(updateTime);
    }
  }, [events, project, isPlaying, isRecording, time, endTime, isLooped]);

  const handlePlayStarted = useCallback(
    (event: SequencerStartedEvent) => {
      const { isPlaying, isRecording, time } = event;

      if (isPlaying) {
        events.emit('seq:play-started', {
          time
        });
      } else if (isRecording) {
        events.emit('seq:record-started', {
          time
        });
      }

      // timeRef.current = time;

      setIsPlaying(isPlaying);
      setIsRecording(isRecording);

      playStartedAtRef.current = performance.now();

      animationRef.current = requestAnimationFrame(updateTime);
      // updateTime();
    },
    [events, updateTime]
  );

  const handleStopped = useCallback(() => {
    log.debug('handlePlayStopped');
    if (animationRef.current === null) return;

    const now = performance.now();
    const currentTime = time + (now - playStartedAtRef.current) / 1000;

    project.send({ type: 'setSequencerTime', time: currentTime });
    events.emit('seq:stopped', {
      time: currentTime
    });

    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    setIsPlaying(false);
    setIsRecording(false);
    // log.debug('handlePlayStopped', event.time);
  }, [events, project, time]);

  useEffect(() => {
    events.emit('seq:time-update', {
      time,
      endTime,
      isPlaying: false,
      isRecording: false
    });
  }, [events, time, endTime]);

  useEffect(() => {
    const evtPlayStarted = project.on('sequencerStarted', handlePlayStarted);
    const evtPlayStopped = project.on('sequencerStopped', handleStopped);
    // const evtRecordStarted = project.on(
    //   'sequencerRecordStarted',
    //   handleRecordStarted
    // );
    // const evtTimeUpdate = project.on('sequencerTimeUpdate', handleTimeUpdate);

    return () => {
      evtPlayStarted.unsubscribe();
      evtPlayStopped.unsubscribe();
      // evtRecordStarted.unsubscribe();
      // evtTimeUpdate.unsubscribe();
    };
  }, [handlePlayStarted, handleStopped, project]);

  return { isPlaying, isRecording, time, endTime, isLooped };
};
