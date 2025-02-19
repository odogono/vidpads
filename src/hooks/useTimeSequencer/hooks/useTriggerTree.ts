import { useMemo } from 'react';

import { msToPixels, pixelsToMs } from '@helpers/time';
import { TriggerNode, insertTriggerEvent } from '@helpers/triggerTree';
import { SequencerEvent } from '@model/types';

interface UseTriggerTreeProps {
  seqEvents: SequencerEvent[];
  seqEventIds: string;
  pixelsPerBeat: number;
  canvasBpm: number;
  bpm: number;
}

export const useTriggerTree = ({
  seqEvents,
  seqEventIds,
  pixelsPerBeat,
  canvasBpm,
  bpm
}: UseTriggerTreeProps) => {
  const triggerTree: TriggerNode | undefined = useMemo(() => {
    const result = seqEvents.reduce(
      (tree, e) => {
        if (!e) return tree;
        const { time, duration, padId, inProgress } = e;

        if (inProgress) return tree;

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

        tree = insertTriggerEvent(tree, {
          event: 'pad:touchdown',
          time: adjTime,
          padId
        });
        tree = insertTriggerEvent(tree, {
          event: 'pad:touchup',
          time: adjTime + adjDuration,
          padId
        });
        return tree;
      },
      undefined as TriggerNode | undefined
    );

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seqEventIds, pixelsPerBeat, canvasBpm, bpm]);

  return { triggerTree };
};
