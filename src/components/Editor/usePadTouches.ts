import { useCallback, useEffect } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { getPadSourceUrl, getPadStartAndEndTime } from '@model/pad';
import { Interval, Pad } from '@model/types';

const log = createLog('usePadTouches');

export interface UsePadTouchesProps {
  isActive?: boolean;
  pad?: Pad | undefined;
}

export const usePadTouches = ({ isActive, pad }: UsePadTouchesProps) => {
  const events = useEvents();

  const handlePadTouchdown = useCallback(
    ({ padId }: { padId: string }) => {
      // log.debug('handlePadTouchdown', { isActive, padId });
      if (!isActive || pad?.id !== padId) return;
      const url = getPadSourceUrl(pad);
      if (!url) return;
      const { start, end } = getPadStartAndEndTime(pad, {
        start: 0,
        end: Number.MAX_SAFE_INTEGER
      }) as Interval;
      events.emit('video:start', {
        start,
        end,
        isLoop: pad.isLooped ?? false,
        url
      });
      // videoRef?.play({ start, end, isLoop: pad.isLooped ?? false, url });
    },
    [events, isActive, pad]
  );

  const handlePadTouchup = useCallback(
    ({ padId }: { padId: string }) => {
      if (!isActive || pad?.id !== padId) return;
      const url = getPadSourceUrl(pad);
      if (!url) return;
      // log.debug('handlePadTouchup', padId);
      if (!pad.isOneShot) {
        // videoRef?.stop({ url });
        events.emit('video:stop', { url });
      }
    },
    [events, isActive, pad]
  );

  useEffect(() => {
    events.on('pad:touchdown', handlePadTouchdown);
    events.on('pad:touchup', handlePadTouchup);

    return () => {
      events.off('pad:touchdown', handlePadTouchdown);
      events.off('pad:touchup', handlePadTouchup);
    };
  }, [events, handlePadTouchdown, handlePadTouchup]);
};
