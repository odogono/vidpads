'use client';

import { useCallback, useEffect } from 'react';

import {
  PlayerThumbnailExtracted,
  PlayerTimeUpdate
} from '@components/Player/types';
import { debounce } from '@helpers/debounce';
import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { usePadTrimOperation } from '@model/hooks/usePadTrimOperations';
import { getPadSourceUrl } from '@model/pad';
import { Pad } from '@model/types';

const log = createLog('useControlsEvents');

export interface UseControlsEventsProps {
  pad: Pad | undefined;
  onTimeUpdate?: ((time: number) => void) | undefined;
}

export const useControlsEvents = ({
  pad,
  onTimeUpdate
}: UseControlsEventsProps) => {
  const events = useEvents();
  // const inputTimeRef = useRef<TimeInputRef | null>(null);
  const applyPadTrimOperation = usePadTrimOperation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleIntervalChange = useCallback(
    debounce(async (start: number, end: number) => {
      if (!pad) return;
      const padSourceUrl = getPadSourceUrl(pad);
      if (!padSourceUrl) return;
      log.debug('handleStartAndEndTimeChange', pad.id, start, end);
      // grab a new thumbnail with the new start time
      events.emit('video:extract-thumbnail', {
        url: padSourceUrl,
        time: start,
        padId: pad.id,
        requestId: `NumericInterval:${pad.id}`,
        additional: {
          start,
          end
        }
      });
    }, 500),
    [events, pad]
  );

  const handleThumbnailExtracted = useCallback(
    async ({ url, thumbnail, additional }: PlayerThumbnailExtracted) => {
      if (!pad) return;
      const padSourceUrl = getPadSourceUrl(pad);
      if (!padSourceUrl || url !== padSourceUrl) return;
      const { start, end } = { start: 0, end: -1, ...additional };

      if (start === 0 && end === -1) return;

      // todo: this shouldn't be done here
      await applyPadTrimOperation({
        pad,
        start,
        end,
        thumbnail
      });
    },
    [applyPadTrimOperation, pad]
  );

  const handlePlayerTimeUpdate = useCallback(
    (e: PlayerTimeUpdate) => {
      if (e.padId !== pad?.id) return;
      onTimeUpdate?.(e.time);
    },
    [pad, onTimeUpdate]
  );

  useEffect(() => {
    events.on('player:time-update', handlePlayerTimeUpdate);
    events.on('video:thumbnail-extracted', handleThumbnailExtracted);
    return () => {
      events.off('player:time-update', handlePlayerTimeUpdate);
      events.off('video:thumbnail-extracted', handleThumbnailExtracted);
    };
  }, [events, handlePlayerTimeUpdate, handleThumbnailExtracted]);

  return {
    handleIntervalChange
  };
};
