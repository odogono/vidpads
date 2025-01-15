'use client';

import { useCallback, useEffect } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { getPadSourceUrl, getPadStartAndEndTime } from '@model/pad';
import { getSelectedPadSourceUrl } from '@model/store/selectors';
import { useStore } from '@model/store/useStore';
import { Interval } from '@model/types';
import { usePlayers } from './usePlayers';

const log = createLog('player/container');

export const PlayerContainer = () => {
  const events = useEvents();
  const { store } = useStore();

  const { pads, players, setVisiblePlayerId } = usePlayers();

  const handlePadTouchdown = useCallback(
    ({ padId }: { padId: string }) => {
      // if (isEditActive) return;
      // log.debug('handlePadTouchdown', padId);
      const pad = pads.find((pad) => pad.id === padId);
      if (!pad) return;

      const mediaUrl = getPadSourceUrl(pad);
      if (!mediaUrl) {
        log.debug('no media url for pad', padId, pad);
        return;
      }

      const isOneShot = pad.isOneShot ?? false;
      const isLoop = pad.isLooped ?? false;
      const { start, end } = getPadStartAndEndTime(pad, {
        start: 0,
        end: Number.MAX_SAFE_INTEGER
      }) as Interval;
      setVisiblePlayerId(mediaUrl);
      events.emit('video:start', {
        url: mediaUrl,
        isOneShot,
        isLoop,
        start,
        end
      });
    },
    [events, setVisiblePlayerId, pads]
  );

  const handlePadTouchup = useCallback(
    ({ padId }: { padId: string }) => {
      // if (isEditActive) return;
      // log.debug('handlePadTouchup', padId);
      const pad = pads.find((pad) => pad.id === padId);
      if (!pad) return;
      const url = getPadSourceUrl(pad);
      if (!url) return;

      const isOneShot = pad.isOneShot ?? false;

      if (!isOneShot) {
        events.emit('video:stop', { url });
      }
    },
    [events, pads]
  );

  useEffect(() => {
    events.on('pad:touchdown', handlePadTouchdown);
    events.on('pad:touchup', handlePadTouchup);

    return () => {
      events.off('pad:touchdown', handlePadTouchdown);
      events.off('pad:touchup', handlePadTouchup);
    };
  }, [events, handlePadTouchdown, handlePadTouchup]);

  useEffect(() => {
    const selectedPadSourceUrl = getSelectedPadSourceUrl(store);
    // log.debug('selectedPadSourceUrl', selectedPadSourceUrl);
    setVisiblePlayerId(selectedPadSourceUrl);
  }, [setVisiblePlayerId, store]);

  // useRenderingTrace('PlayerContainer', {
  //   players,
  //   visiblePlayerId
  // });

  return <>{players}</>;
};
