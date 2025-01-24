import { useCallback, useEffect, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { usePlayerState } from '@model/hooks/usePlayersState';
import { Pad } from '@model/types';
import { useQueryClient } from '@tanstack/react-query';
import { PlayerPlaying, PlayerStopped } from '../Player/types';

const log = createLog('PadComponent/usePlayerEvents');

export const usePlayerEvents = (pad: Pad) => {
  const events = useEvents();
  const padId = pad.id;
  // const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);
  const queryClient = useQueryClient();
  const { player } = usePlayerState(padId);

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
    // const url = getPadSourceUrl(pad);

    // // handle the player being ready before this component is mounted
    // if (url) {
    //   const isReady = player?.isReady;
    //   setIsPlayerReady(isReady);
    //   // if (pad.id === 'a1') log.debug('🎉 useEffect', pad.id, { url, isReady });
    // }

    events.on('player:playing', handlePlayerPlaying);
    events.on('player:stopped', handlePlayerStopped);
    return () => {
      events.off('player:playing', handlePlayerPlaying);
      events.off('player:stopped', handlePlayerStopped);
    };
  }, [
    events,
    handlePlayerPlaying,
    handlePlayerStopped,
    pad,
    queryClient,
    player
  ]);
  return {
    isPlayerReady: player?.isReady,
    isPlayerPlaying
  };
};
