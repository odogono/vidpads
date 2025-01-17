import { useCallback, useEffect, useState } from 'react';

import { useEvents } from '@helpers/events';
import { Pad } from '@model/types';
import { useQueryClient } from '@tanstack/react-query';
import { createLog } from '../../helpers/log';
import { getPadSourceUrl } from '../../model/pad';
import { getPlayerReadyInCache } from '../Player/helpers';
import {
  PlayerNotReady,
  PlayerPlaying,
  PlayerReady,
  PlayerStopped
} from '../Player/types';

const log = createLog('PadComponent/usePlayerEvents');

export const usePlayerEvents = (pad: Pad) => {
  const events = useEvents();
  const padId = pad.id;
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);
  const queryClient = useQueryClient();

  const handlePlayerReady = useCallback(
    (e: PlayerReady) => {
      // log.debug('🎉 player:ready', e.padId, padId);
      if (e.padId !== padId) return;
      setIsPlayerReady(true);
    },
    [padId]
  );

  const handlePlayerNotReady = useCallback(
    (e: PlayerNotReady) => {
      // log.debug('🎉 player:not-ready', e.padId, padId);
      if (e.padId !== padId) return;
      setIsPlayerPlaying(false);
      setIsPlayerReady(false);
    },
    [padId]
  );

  const handlePlayerPlaying = useCallback(
    (e: PlayerPlaying) => {
      if (e.padId !== padId) return;
      setIsPlayerPlaying(true);
    },
    [padId]
  );

  const handlePlayerStopped = useCallback(
    (e: PlayerStopped) => {
      if (e.padId !== padId) return;
      setIsPlayerPlaying(false);
    },
    [padId]
  );

  useEffect(() => {
    const url = getPadSourceUrl(pad);

    // handle the player being ready before this component is mounted
    if (url) {
      const isReady = getPlayerReadyInCache(queryClient, url, pad.id);
      setIsPlayerReady(isReady);
      if (pad.id === 'a1') log.debug('🎉 useEffect', pad.id, { url, isReady });
    }

    events.on('player:ready', handlePlayerReady);
    events.on('player:not-ready', handlePlayerNotReady);
    events.on('player:playing', handlePlayerPlaying);
    events.on('player:stopped', handlePlayerStopped);
    return () => {
      events.off('player:ready', handlePlayerReady);
      events.off('player:not-ready', handlePlayerNotReady);
      events.off('player:playing', handlePlayerPlaying);
      events.off('player:stopped', handlePlayerStopped);
    };
  }, [
    events,
    handlePlayerReady,
    handlePlayerNotReady,
    handlePlayerPlaying,
    handlePlayerStopped,
    pad,
    queryClient
  ]);
  return {
    isPlayerReady,
    isPlayerPlaying
  };
};
