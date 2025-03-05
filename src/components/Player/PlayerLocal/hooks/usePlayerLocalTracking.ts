import { RefObject, useCallback, useEffect, useRef } from 'react';

import { PlayerSeek } from '@components/Player/types';
import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';

const log = createLog('player/local/hooks/usePlayerLocalTracking', [
  'debug',
  'error'
]);

interface UsePlayerLocalTrackingProps {
  video: HTMLVideoElement | null;
  mediaUrl: string;
  playerPadId: string;
  seekVideo: (props: PlayerSeek) => void;
  // stopVideo: (props: PlayerStop) => void;
  endTimeRef: RefObject<number>;
  startTimeRef: RefObject<number>;
  isLoopedRef: RefObject<boolean>;
}

export const usePlayerLocalTracking = ({
  video,
  mediaUrl,
  playerPadId,
  seekVideo,
  endTimeRef,
  startTimeRef,
  isLoopedRef
}: UsePlayerLocalTrackingProps) => {
  const animationRef = useRef<number | null>(null);
  const events = useEvents();

  const stopTimeTracking = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const updateTimeTracking = useCallback(() => {
    if (!video) return;
    const time = video.currentTime;
    const duration = video.duration;
    // log.debug('updateTimeTracking', {
    //   time,
    //   duration,
    //   end: endTimeRef.current
    // });
    if (time !== undefined && duration !== undefined) {
      if (time >= endTimeRef.current) {
        if (isLoopedRef.current) {
          log.debug('updateTimeTracking', 'looping', {
            time,
            endTime: endTimeRef.current,
            startTime: startTimeRef.current
          });
          seekVideo({
            url: mediaUrl,
            padId: playerPadId,
            time: startTimeRef.current,
            inProgress: false,
            requesterId: 'local-player',
            fromId: 'timeline'
          });
          // video.play();
        } else {
          video.pause();
          // stopVideo({
          //   url: mediaUrl,
          //   padId: playerPadId,
          //   time
          // });
        }
      }

      events.emit('player:time-updated', {
        url: mediaUrl,
        padId: playerPadId,
        time,
        duration
      });
    }

    if (animationRef.current !== null) {
      animationRef.current = requestAnimationFrame(updateTimeTracking);
    }
  }, [
    endTimeRef,
    events,
    isLoopedRef,
    mediaUrl,
    playerPadId,
    seekVideo,
    startTimeRef,
    video
  ]);

  const startTimeTracking = useCallback(() => {
    if (animationRef.current !== null) {
      return;
    }
    animationRef.current = requestAnimationFrame(updateTimeTracking);
  }, [updateTimeTracking]);

  useEffect(() => {
    log.debug(
      'changed',
      startTimeRef.current,
      endTimeRef.current,
      isLoopedRef.current
    );
  }, [startTimeRef, endTimeRef, isLoopedRef]);

  return {
    startTimeTracking,
    stopTimeTracking
  };
};
