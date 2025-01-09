import { useCallback, useEffect, useRef, useState } from 'react';

import { PlayerRef } from '@components/Player/types';
import { createLog } from '@helpers/log';
import { getPadStartAndEndTime } from '@model/pad';
import { Pad } from '@model/types';

const log = createLog('useStartAndEndTime');

export interface UseStartAndEndTimeProps {
  isActive: boolean;
  pad?: Pad | undefined;
  videoRef: PlayerRef | null;
  duration: number;
  onStartAndEndTimeChange: (start: number, end: number) => void;
}

export const useStartAndEndTime = ({
  isActive,
  pad,
  videoRef,
  duration,
  onStartAndEndTimeChange
}: UseStartAndEndTimeProps) => {
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
    onStartAndEndTimeChange(startTime, endTime);
  }, [slideValue, videoRef, onStartAndEndTimeChange]);

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
    onStartAndEndTimeChange(startTime, endTime);
  }, [slideValue, videoRef, onStartAndEndTimeChange]);

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

  const handleSlideChangeEnd = useCallback(
    (value: number | number[]) => {
      const [startTime, endTime] = Array.isArray(value)
        ? value
        : [value, value];
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

      if (startTime !== lastStartTime || endTime !== lastEndTime) {
        onStartAndEndTimeChange(startTime, endTime);
      }

      log.debug('[handleSlideChangeEnd]', value);

      // update the pad
      existingValueRef.current = [startTime, endTime];
    },
    [onStartAndEndTimeChange]
  );

  useEffect(() => {
    if (!pad || !isActive) return;
    const { start, end } = getPadStartAndEndTime(pad);
    const startTime = start === -1 ? 0 : start;
    const endTime = end === -1 ? duration : end;

    setSlideValue([startTime, endTime]);
    lastValueRef.current = [startTime, endTime];
    existingValueRef.current = [startTime, endTime];
  }, [duration, pad, isActive]);

  return {
    handleSlideChange,
    handleSlideChangeEnd,
    slideValue,
    handleDurationBack,
    handleDurationForward
  };
};
