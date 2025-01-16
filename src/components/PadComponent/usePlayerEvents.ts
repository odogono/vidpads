import { useCallback, useEffect, useState } from 'react';

import { useEvents } from '@helpers/events';
import {
  PlayerNotReady,
  PlayerPlaying,
  PlayerReady,
  PlayerStopped
} from '../Player/types';

export const usePlayerEvents = (padId: string) => {
  const events = useEvents();
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);

  const handlePlayerReady = useCallback(
    (e: PlayerReady) => {
      if (e.padId !== padId) return;
      setIsPlayerReady(true);
    },
    [padId]
  );

  const handlePlayerNotReady = useCallback(
    (e: PlayerNotReady) => {
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
    handlePlayerStopped
  ]);
  return {
    isPlayerReady,
    isPlayerPlaying
  };
};
