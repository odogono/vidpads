import { useCallback, useRef } from 'react';

import {
  getPlayerDataState,
  hidePlayer,
  setPlayerDataState,
  showPlayer
} from '../helpers';
import { PlayerPlaying } from '../types';

export const usePlayingStack = () => {
  const ref = useRef<PlayerPlaying[]>([]);

  const hideStackPlayer = useCallback((hideId: string) => {
    const stack = ref.current;
    if (stack.length > 1) {
      hidePlayer(hideId);
      ref.current = stack.filter(({ padId }) => padId !== hideId);
    }

    // remove the player from the stack
    setPlayerDataState(hideId, 'stopped');
  }, []);

  const showStackPlayer = useCallback((player: PlayerPlaying) => {
    const showId = player.padId;
    const stack = ref.current;

    // remove players that are not playing
    const playingStack = stack.filter(({ padId }) => {
      const active = getPlayerDataState(padId) === 'playing';
      if (!active) {
        hidePlayer(padId);
      }
      return active;
    });

    // places the new player on top of the stack
    const newStack = [
      ...playingStack.filter(({ padId }) => padId !== showId),
      player
    ];

    // sort the stack by priority
    const sortedStack = newStack.sort(
      (a, b) => (a.playPriority ?? 0) - (b.playPriority ?? 0)
    );

    // Update z-index of all players based on stack position
    sortedStack.forEach(({ padId }, index) => showPlayer(padId, index + 1));

    ref.current = sortedStack;
  }, []);

  const getChokeGroupPlayers = useCallback((chokeGroup: number) => {
    return ref.current.filter(({ chokeGroup: group }) => group === chokeGroup);
  }, []);

  return {
    playingStackRef: ref,
    hideStackPlayer,
    showStackPlayer,
    getChokeGroupPlayers
  };
};
