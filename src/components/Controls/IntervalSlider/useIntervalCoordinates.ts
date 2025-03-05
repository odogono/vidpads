import { useCallback, useEffect, useMemo, useState } from 'react';

import { roundNumberToDecimalPlaces as roundDP } from '@helpers/number';
import { Rect } from '@types';

interface UseIntervalCoordinatesProps {
  duration: number;
  trackArea: Rect;
  intervalStart: number;
  intervalEnd: number;
}

export const useIntervalCoordinates = ({
  duration,
  trackArea,
  intervalStart,
  intervalEnd
}: UseIntervalCoordinatesProps) => {
  const intervalToX = useCallback(
    (timeInSeconds: number) => {
      if (!duration) {
        return trackArea.x;
      }
      return timeInSeconds * (trackArea.width / duration) + trackArea.x;
    },
    [duration, trackArea.width, trackArea.x]
  );

  const xToInterval = useCallback(
    (x: number) => roundDP((x - trackArea.x) * (duration / trackArea.width)),
    [duration, trackArea.width, trackArea.x]
  );

  const [intervalStartX, setIntervalStartX] = useState(() =>
    intervalToX(intervalStart)
  );
  const [intervalEndX, setIntervalEndX] = useState(() =>
    intervalToX(intervalEnd)
  );

  useEffect(() => {
    setIntervalStartX(intervalToX(intervalStart));
    setIntervalEndX(intervalToX(intervalEnd));
  }, [intervalStart, intervalEnd, intervalToX]);

  const trackTimeWidth = useMemo(() => {
    // default to 5 minutes
    let time = 5 * 60;
    // if duration is less than 30 seconds, use 1 second
    if (duration < 30) time = 1;
    // if duration is less than 60 seconds, use 5 seconds
    else if (duration < 60) time = 5;
    // if duration is less than 5 minutes, use 10 seconds
    else if (duration < 5 * 60) time = 10;
    // if duration is less than 1 hour, use 1 minute
    else if (duration < 3600) time = 60;
    return intervalToX(time) - trackArea.x;
  }, [intervalToX, trackArea.x, duration]);

  return {
    intervalToX,
    xToInterval,
    intervalStartX,
    intervalEndX,
    setIntervalStartX,
    setIntervalEndX,
    trackTimeWidth
  };
};
