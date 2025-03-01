import { useCallback, useEffect, useState } from 'react';

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
    (time: number) => {
      if (!duration) {
        return trackArea.x;
      }
      return time * (trackArea.width / duration) + trackArea.x;
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

  return {
    intervalToX,
    xToInterval,
    intervalStartX,
    intervalEndX,
    setIntervalStartX,
    setIntervalEndX
  };
};
