import { useCallback, useEffect, useState } from 'react';

import { PlayerPlaying, PlayerStopped } from '@components/Player/types';
// import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { usePlayerState } from '@model/hooks/usePlayerState';
import { Pad } from '@model/types';
import { useQueryClient } from '@tanstack/react-query';

// const log = createLog('PadComponent/usePlayerEvents');

export const usePlayerEvents = (pad: Pad) => {
  const events = useEvents();
  const padId = pad.id;

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
    isPlayerPlaying,
    isPlayerError: player?.isError,
    playerError: player?.error
  };
};
