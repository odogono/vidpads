import { useCallback, useEffect, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { getPadStartAndEndTime } from '@model/pad';
import { useEditActive } from '@model/store/selectors';
import { Player } from './Player';
import { usePlayers } from './usePlayers';

const log = createLog('player/container');

export const PlayerContainer = () => {
  const events = useEvents();
  const { isEditActive } = useEditActive();

  const {
    getMediaUrlFromPadId,
    pads,
    players,
    visiblePlayerId,
    setVisiblePlayerId
  } = usePlayers();

  const handlePadTouchdown = useCallback(
    ({ padId }: { padId: string }) => {
      if (isEditActive) return;
      log.debug('handlePadTouchdown', padId);

      const mediaUrl = getMediaUrlFromPadId(padId);
      if (!mediaUrl) {
        log.debug('no media url for pad', padId);
        return;
      }

      const pad = pads.find((pad) => pad.id === padId);
      if (!pad) return;
      const isOneShot = pad.isOneShot ?? false;
      const { start, end } = getPadStartAndEndTime(pad);
      setVisiblePlayerId(mediaUrl);
      events.emit('video:start', { url: mediaUrl, isOneShot, time: start });
    },
    [events, getMediaUrlFromPadId, setVisiblePlayerId, isEditActive, pads]
  );

  const handlePadTouchup = useCallback(
    ({ padId }: { padId: string }) => {
      if (isEditActive) return;
      log.debug('handlePadTouchup', padId);
      const url = getMediaUrlFromPadId(padId);
      if (!url) return;

      const pad = pads.find((pad) => pad.id === padId);
      if (!pad) return;
      const isOneShot = pad.isOneShot ?? false;

      if (!isOneShot) {
        events.emit('video:stop', { url });
      }
    },
    [events, getMediaUrlFromPadId, isEditActive, pads]
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
    if (isEditActive) {
      setVisiblePlayerId(null);
    }
  }, [isEditActive, setVisiblePlayerId]);

  // if (isReady) log.debug('render', Object.values(players).length);

  // useRenderingTrace('PlayerContainer', {
  //   players,
  //   isReady,
  //   visiblePlayerId,
  //   store,
  //   events
  // });

  return (
    <>
      {Object.values(players).map((player) => (
        <Player
          key={player.media.url}
          {...player}
          isVisible={player.media.url === visiblePlayerId}
        />
      ))}
    </>
  );
};
