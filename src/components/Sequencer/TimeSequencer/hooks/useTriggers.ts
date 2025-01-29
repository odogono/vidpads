import { useMemo, useRef } from 'react';

import { SequencerEvent } from '@model/types';
import { msToPixels, pixelsToMs } from '../helpers/timeConversion';

interface TriggerEvent {
  event: 'pad:touchdown' | 'pad:touchup';
  time: number;
  padId: string;
}

export const useTriggers = (
  sequencerEvents: SequencerEvent[],
  pixelsPerBeat: number,
  canvasBpm: number,
  bpm: number
) => {
  const triggerIndex = useRef(0);

  const { triggers } = useMemo(() => {
    const result = sequencerEvents.reduce((acc, e) => {
      if (!e) return acc;
      const { time, duration, padId } = e;

      const adjTime = pixelsToMs(
        msToPixels(time, pixelsPerBeat, canvasBpm),
        pixelsPerBeat,
        bpm
      );
      const adjDuration = pixelsToMs(
        msToPixels(duration, pixelsPerBeat, canvasBpm),
        pixelsPerBeat,
        bpm
      );

      acc.push({ event: 'pad:touchdown', time: adjTime, padId });
      acc.push({ event: 'pad:touchup', time: adjTime + adjDuration, padId });
      return acc;
    }, [] as TriggerEvent[]);

    return { triggers: result };
  }, [bpm, sequencerEvents, canvasBpm, pixelsPerBeat]);

  return { triggers, triggerIndex };
};
