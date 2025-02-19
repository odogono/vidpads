import { useMemo } from 'react';

import { secondsToPixels } from '@helpers/time';
import { SequencerEvent } from '@model/types';

interface UseSelectedEventsRectProps {
  padCount: number;
  seqSelectedEvents: SequencerEvent[];
  pixelsPerBeat: number;
  canvasBpm: number;
  seqSelectedEventIds: string;
  getGridDimensions: () => { gridHeight: number; rowHeight: number };
}

export const useSelectedEventsRect = ({
  padCount,
  seqSelectedEvents,
  pixelsPerBeat,
  canvasBpm,
  seqSelectedEventIds,
  getGridDimensions
}: UseSelectedEventsRectProps) => {
  return useMemo(() => {
    const { rowHeight } = getGridDimensions();

    const { minX, minY, maxX, maxY } = seqSelectedEvents.reduce(
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

    if (minX === Number.MAX_VALUE) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    }

    return {
      x: minX + 10,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [padCount, seqSelectedEventIds]);
};
