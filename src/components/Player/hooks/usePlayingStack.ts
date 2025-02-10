import { useCallback, useRef } from 'react';

// import { createLog } from '@helpers/log';
import {
  getPlayerDataState,
  hidePlayer,
  setPlayerDataState,
  showPlayer
} from '../helpers';
import { PlayerPlaying } from '../types';

// const log = createLog('usePlayingStack');

export const usePlayingStack = ({
  hidePlayerOnEnd
}: {
  hidePlayerOnEnd: boolean;
}) => {
  const ref = useRef<PlayerPlaying[]>([]);

  const hideStackPlayer = useCallback(
    (hideId: string) => {
      const stack = ref.current;

      if (hidePlayerOnEnd || stack.length > 1) {
        hidePlayer(hideId);
        ref.current = stack.filter(({ padId }) => padId !== hideId);
      }

      const stackLength = ref.current.length;

      setPlayerDataState(hideId, 'stopped');

      if (stackLength === 0) {
        showPlayer('title');
      }

      // return the number of players in the stack
      return stackLength;
    },
    [hidePlayerOnEnd]
  );

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
    sortedStack.forEach(({ padId }, index) => {
      if (index === sortedStack.length - 1) {
        showPlayer(padId, 1);
      } else {
        hidePlayer(padId);
      }
    });

    ref.current = sortedStack;
    const stackLength = sortedStack.length;

    if (stackLength === 0) {
      showPlayer('title', stackLength + 1);
    } else {
      hidePlayer('title');
    }

    return stackLength;
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
