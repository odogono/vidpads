import { useCallback, useEffect } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { getPadSourceUrl, getPadStartAndEndTime } from '@model/pad';
import { Pad } from '@model/types';
import { PlayerRef } from '../Player/types';

const log = createLog('usePadTouches');

export interface UsePadTouchesProps {
  isActive?: boolean;
  pad?: Pad | undefined;
  videoRef: PlayerRef | null;
}

export const usePadTouches = ({
  isActive,
  pad,
  videoRef
}: UsePadTouchesProps) => {
  const events = useEvents();

  const handlePadTouchdown = useCallback(
    ({ padId }: { padId: string }) => {
      // log.debug('handlePadTouchdown', { isActive, padId });
      if (!isActive || pad?.id !== padId) return;
      const url = getPadSourceUrl(pad);
      if (!url) return;
      const { start, end } = getPadStartAndEndTime(pad);
      videoRef?.play({ start, end, isLoop: pad.isLooped ?? false, url });
    },
    [isActive, pad, videoRef]
  );

  const handlePadTouchup = useCallback(
    ({ padId }: { padId: string }) => {
      if (!isActive || pad?.id !== padId) return;
      const url = getPadSourceUrl(pad);
      if (!url) return;
      // log.debug('handlePadTouchup', padId);
      if (!pad.isOneShot) {
        videoRef?.stop({ url });
      }
    },
    [isActive, pad, videoRef]
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
