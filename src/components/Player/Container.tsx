'use client';

import { useCallback, useEffect, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { getPadSourceUrl, getPadStartAndEndTime } from '@model/pad';
import { getSelectedPadSourceUrl } from '@model/store/selectors';
import { useStore } from '@model/store/useStore';
import { Interval } from '@model/types';
import { Player } from './Player';
import { PlayerPlaying, PlayerStopped } from './types';
import { usePlayers } from './usePlayers';

const log = createLog('player/container');

export const PlayerContainer = () => {
  const events = useEvents();
  const { store } = useStore();

  const { pads, players, setVisiblePlayerId } = usePlayers();

  const handlePadTouchdown = useCallback(
    ({ padId }: { padId: string }) => {
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
        padId: pad.id,
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
        events.emit('video:stop', { url, padId });
      }
    },
    [events, pads]
  );

  const [playingStack, setPlayingStack] = useState<string[]>([]);

  const handlePlayerPlaying = useCallback((e: PlayerPlaying) => {
    log.debug('❤️ player:playing', e);

    setPlayingStack((prev) => {
      // remove the padId from the stack if it is already in the stack
      return [...prev.filter((id) => id !== e.padId), e.padId];
    });
  }, []);

  const handlePlayerStopped = useCallback((e: PlayerStopped) => {
    log.debug('❤️ player:stopped', e);
    // hide the player
    // remove from the stack of playing players
    setPlayingStack((prev) => prev.filter((id) => id !== e.padId));
  }, []);

  useEffect(() => {
    events.on('pad:touchdown', handlePadTouchdown);
    events.on('pad:touchup', handlePadTouchup);

    events.on('player:playing', handlePlayerPlaying);

    events.on('player:stopped', handlePlayerStopped);

    return () => {
      events.off('pad:touchdown', handlePadTouchdown);
      events.off('pad:touchup', handlePadTouchup);
    };
  }, [
    events,
    handlePadTouchdown,
    handlePadTouchup,
    handlePlayerPlaying,
    handlePlayerStopped
  ]);

  useEffect(() => {
    const selectedPadSourceUrl = getSelectedPadSourceUrl(store);
    // log.debug('selectedPadSourceUrl', selectedPadSourceUrl);
    setVisiblePlayerId(selectedPadSourceUrl);
  }, [setVisiblePlayerId, store]);

  // useRenderingTrace('PlayerContainer', {
  //   players,
  //   visiblePlayerId
  // });

  log.debug('❤️ playingStack', playingStack);
  return (
    <>
      {players.map((player) => {
        const isPlaying = playingStack.includes(player.padId);
        return <Player key={player.id} {...player} isVisible={isPlaying} />;
      })}
    </>
  );
};
