import { useCallback, useEffect, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { getPadSourceUrl, getPadStartAndEndTime } from '@model/pad';
import { Pad } from '@model/types';

const log = createLog('useStartAndEndTime');

export interface UseStartAndEndTimeProps {
  isActive: boolean;
  pad?: Pad | undefined;
  duration: number;
  onStartAndEndTimeChange: (start: number, end: number) => void;
}

export const useStartAndEndTime = ({
  isActive,
  pad,
  duration,
  onStartAndEndTimeChange
}: UseStartAndEndTimeProps) => {
  const events = useEvents();
  const [slideValue, setSlideValue] = useState<number[]>([0, duration]);
  const [isSeeking, setIsSeeking] = useState(false);
  const lastValueRef = useRef<number[]>([0, duration]);
  const existingValueRef = useRef<number[]>([0, duration]);
  const wasStartPressedLast = useRef(true);
  const padSourceUrl = getPadSourceUrl(pad);

  const setVideoTime = useCallback(
    (time: number) => {
      if (!padSourceUrl) return;
      events.emit('video:seek', { url: padSourceUrl, time });
    },
    [events, padSourceUrl]
  );

  const handleDurationBack = useCallback(() => {
    let [startTime, endTime] = slideValue;

    if (wasStartPressedLast.current) {
      startTime = startTime - 0.1;
      setVideoTime(startTime);
    } else {
      endTime = endTime - 0.1;
      setVideoTime(endTime);
    }

    setSlideValue([startTime, endTime]);
    lastValueRef.current = [startTime, endTime];
    existingValueRef.current = [startTime, endTime];
    onStartAndEndTimeChange(startTime, endTime);
  }, [slideValue, setVideoTime, onStartAndEndTimeChange]);

  const handleDurationForward = useCallback(() => {
    let [startTime, endTime] = slideValue;

    if (wasStartPressedLast.current) {
      startTime = startTime + 0.1;
      setVideoTime(startTime);
    } else {
      endTime = endTime + 0.1;
      setVideoTime(endTime);
    }

    setSlideValue([startTime, endTime]);
    lastValueRef.current = [startTime, endTime];
    existingValueRef.current = [startTime, endTime];
    onStartAndEndTimeChange(startTime, endTime);
  }, [slideValue, setVideoTime, onStartAndEndTimeChange]);

  const handleSlideChange = useCallback(
    (value: number | number[]) => {
      const [startTime, endTime] = Array.isArray(value)
        ? value
        : [value, value];
      const [lastStartTime, lastEndTime] = lastValueRef.current;

      if (startTime !== lastStartTime) {
        wasStartPressedLast.current = true;
        // log.debug('[handleSlideChange] startTime', { startTime, endTime });
        setVideoTime(startTime);
      }

      if (endTime !== lastEndTime) {
        wasStartPressedLast.current = false;
        // log.debug('[handleSlideChange] endTime', { startTime, endTime });
        setVideoTime(endTime);
      }

      lastValueRef.current = [startTime, endTime];
      setIsSeeking(true);
      setSlideValue([startTime, endTime]);
    },
    [setVideoTime]
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
      setIsSeeking(false);
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
    isSeeking,
    handleSlideChange,
    handleSlideChangeEnd,
    slideValue,
    handleDurationBack,
    handleDurationForward
  };
};
