'use client';

import { useCallback, useEffect } from 'react';

import {
  PlayerThumbnailExtracted,
  PlayerTimeUpdate
} from '@components/Player/types';
import { debounce } from '@helpers/debounce';
import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { usePadTrimOperation } from '@model/hooks/usePadTrimOperations';
import { getPadSourceUrl } from '@model/pad';
import { Pad } from '@model/types';

const log = createLog('useControlsEvents', ['debug']);

export interface UseControlsEventsProps {
  pad: Pad | undefined;
  onTimeUpdate?: ((time: number) => void) | undefined;
}

export interface HandleSeekProps {
  time: number;
  inProgress?: boolean;
  fromId: 'start' | 'end' | 'timeline';
}

export interface HandleIntervalChangeProps {
  start: number;
  end: number;
  fromId: 'start' | 'end' | 'timeline';
}

export const useControlsEvents = ({
  pad,
  onTimeUpdate
}: UseControlsEventsProps) => {
  const events = useEvents();
  // const inputTimeRef = useRef<TimeInputRef | null>(null);
  const applyPadTrimOperation = usePadTrimOperation();

  const handleSeek = useCallback(
    ({ time, inProgress = true, fromId }: HandleSeekProps) => {
      if (!pad) return;
      events.emit('video:seek', {
        url: getPadSourceUrl(pad)!,
        padId: pad.id,
        time,
        inProgress,
        requesterId: 'useControlsEvents',
        fromId
      });
    },
    [pad, events]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleIntervalChange = useCallback(
    debounce(async ({ start, end, fromId }: HandleIntervalChangeProps) => {
      if (!pad) return;
      const padSourceUrl = getPadSourceUrl(pad);
      if (!padSourceUrl) return;
      log.debug('handleStartAndEndTimeChange', pad.id, { start, end, fromId });

      await applyPadTrimOperation({
        pad,
        start,
        end,
        thumbnail: undefined
      });

      // grab a new thumbnail with the new start time
      events.emit('video:extract-thumbnail', {
        url: padSourceUrl,
        time: start,
        padId: pad.id,
        requestId: `NumericInterval:${pad.id}`,
        fromId,
        additional: {
          start,
          end,
          fromId
        }
      });
    }, 50),
    [events, pad, applyPadTrimOperation]
  );

  const handleThumbnailExtracted = useCallback(
    async ({ url, thumbnail, additional }: PlayerThumbnailExtracted) => {
      if (!pad) return;
      const padSourceUrl = getPadSourceUrl(pad);
      if (!padSourceUrl || url !== padSourceUrl) return;
      const { start, end } = { start: 0, end: -1, ...additional };

      if (start === 0 && end === -1) return;

      log.debug('handleThumbnailExtracted', { start, end });

      await applyPadTrimOperation({
        pad,
        start,
        end,
        thumbnail
      });
    },
    [pad, applyPadTrimOperation]
  );

  const handlePlayerTimeUpdate = useCallback(
    (e: PlayerTimeUpdate) => {
      if (e.padId !== pad?.id) return;
      onTimeUpdate?.(e.time);
    },
    [pad, onTimeUpdate]
  );

  useEffect(() => {
    events.on('player:time-updated', handlePlayerTimeUpdate);
    events.on('video:thumbnail-extracted', handleThumbnailExtracted);
    return () => {
      events.off('player:time-updated', handlePlayerTimeUpdate);
      events.off('video:thumbnail-extracted', handleThumbnailExtracted);
    };
  }, [events, handlePlayerTimeUpdate, handleThumbnailExtracted]);

  return {
    handleSeek,
    handleIntervalChange
  };
};
