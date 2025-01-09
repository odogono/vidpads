import { useCallback, useEffect, useRef, useState } from 'react';

import { PlayerRef } from '@components/Player/types';
import { createLog } from '@helpers/log';

const log = createLog('useStartAndEndTime');

export const useStartAndEndTime = (
  videoRef: PlayerRef | null,
  duration: number
) => {
  const [slideValue, setSlideValue] = useState<number[]>([0, duration]);
  const lastValueRef = useRef<number[]>([0, duration]);
  const existingValueRef = useRef<number[]>([0, duration]);
  const wasStartPressedLast = useRef(true);

  const handleDurationBack = useCallback(() => {
    let [startTime, endTime] = slideValue;

    if (wasStartPressedLast.current) {
      startTime = startTime - 0.1;
      videoRef?.setCurrentTime(startTime);
    } else {
      endTime = endTime - 0.1;
      videoRef?.setCurrentTime(endTime);
    }

    setSlideValue([startTime, endTime]);
    lastValueRef.current = [startTime, endTime];
    existingValueRef.current = [startTime, endTime];
  }, [slideValue, videoRef]);

  const handleDurationForward = useCallback(() => {
    let [startTime, endTime] = slideValue;

    if (wasStartPressedLast.current) {
      startTime = startTime + 0.1;
      videoRef?.setCurrentTime(startTime);
    } else {
      endTime = endTime + 0.1;
      videoRef?.setCurrentTime(endTime);
    }

    setSlideValue([startTime, endTime]);
    lastValueRef.current = [startTime, endTime];
    existingValueRef.current = [startTime, endTime];
  }, [slideValue, videoRef]);

  const handleSlideChange = useCallback(
    (value: number | number[]) => {
      const [startTime, endTime] = Array.isArray(value)
        ? value
        : [value, value];
      const [lastStartTime, lastEndTime] = lastValueRef.current;

      if (startTime !== lastStartTime) {
        wasStartPressedLast.current = true;
        videoRef?.setCurrentTime(startTime);
      }

      if (endTime !== lastEndTime) {
        wasStartPressedLast.current = false;
        videoRef?.setCurrentTime(endTime);
      }

      lastValueRef.current = [startTime, endTime];
      setSlideValue([startTime, endTime]);
    },
    [videoRef]
  );

  const handleSlideChangeEnd = useCallback((value: number | number[]) => {
    const [startTime, endTime] = Array.isArray(value) ? value : [value, value];
    const [lastStartTime, lastEndTime] = existingValueRef.current;

    if (startTime !== lastStartTime) {
      log.debug(
        '[handleSlideChangeEnd] startTime has changed from',
        lastStartTime,
        'to',
        startTime
      );
    }

    if (endTime !== lastEndTime) {
      log.debug(
        '[handleSlideChangeEnd] endTime has changed from',
        lastEndTime,
        'to',
        endTime
      );
    }

    log.debug('[handleSlideChangeEnd]', value);

    // update the pad
    existingValueRef.current = [startTime, endTime];
  }, []);

  useEffect(() => {
    setSlideValue([0, duration]);
    lastValueRef.current = [0, duration];
    existingValueRef.current = [0, duration];
  }, [duration]);

  return {
    handleSlideChange,
    handleSlideChangeEnd,
    slideValue,
    handleDurationBack,
    handleDurationForward
  };
};
