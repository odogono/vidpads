import { useCallback, useEffect } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { Pad } from '@model/types';
import { PlayerRef } from '../Player/types';

const log = createLog('usePadTouches');

export interface UsePadTouchesProps {
  isActive?: boolean;
  pad: Pad;
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
      if (isActive) return;
      if (pad?.id !== padId) return;
      log.debug('handlePadTouchdown', padId);

      // const mediaUrl = getMediaUrlFromPadId(padId);
      // if (!mediaUrl) {
      //   log.debug('no media url for pad', padId);
      //   return;
      // }

      // const pad = pads.find((pad) => pad.id === padId);
      // if (!pad) return;
      // const isOneShot = pad.isOneShot ?? false;
      // setVisiblePlayerId(mediaUrl);
      // events.emit('video:start', { url: mediaUrl, isOneShot });
    },
    [events, isActive, pad]
  );

  const handlePadTouchup = useCallback(
    ({ padId }: { padId: string }) => {
      if (isActive) return;
      if (pad?.id !== padId) return;
      // log.debug('handlePadTouchup', padId);
      // const url = getMediaUrlFromPadId(padId);
      // if (!url) return;

      // const pad = pads.find((pad) => pad.id === padId);
      // if (!pad) return;
      // const isOneShot = pad.isOneShot ?? false;

      // if (!isOneShot) {
      //   events.emit('video:stop', { url });
      // }
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
