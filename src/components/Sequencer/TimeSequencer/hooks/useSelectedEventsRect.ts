import { useMemo } from 'react';

import { SequencerEvent } from '@model/types';
import { secondsToPixels } from '../helpers/timeConversion';

interface UseSelectedEventsRectProps {
  padCount: number;
  selectedEvents: SequencerEvent[];
  pixelsPerBeat: number;
  canvasBpm: number;
  selectedEventIds: string;
  getGridDimensions: () => { gridHeight: number; rowHeight: number };
}

export const useSelectedEventsRect = ({
  padCount,
  selectedEvents,
  pixelsPerBeat,
  canvasBpm,
  selectedEventIds,
  getGridDimensions
}: UseSelectedEventsRectProps) => {
  return useMemo(() => {
    const { rowHeight } = getGridDimensions();

    const { minX, minY, maxX, maxY } = selectedEvents.reduce(
      (acc, e) => {
        const { time, duration } = e;
        const x = secondsToPixels(time, pixelsPerBeat, canvasBpm);
        const width = secondsToPixels(duration, pixelsPerBeat, canvasBpm);

        const y = rowHeight * Number(e.padId.substring(1));
        const height = rowHeight;

        acc.minX = Math.min(acc.minX, x);
        acc.minY = Math.min(acc.minY, y);
        acc.maxX = Math.max(acc.maxX, x + width);
        acc.maxY = Math.max(acc.maxY, y + height);

        return acc;
      },
      {
        minX: Number.MAX_VALUE,
        minY: Number.MAX_VALUE,
        maxX: -Number.MAX_VALUE,
        maxY: -Number.MAX_VALUE
      }
    );

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [padCount, selectedEventIds]);
};
