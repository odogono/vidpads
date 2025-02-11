import { useCallback } from 'react';

import { createLog } from '@helpers/log';
import {
  getAllPlayerDataState,
  hidePlayer,
  setPlayerData,
  setPlayerDataStatePlaying,
  showPlayer
} from '../helpers';
import { PlayerPlaying } from '../types';

const log = createLog('usePlayingStack', ['debug']);

export const usePlayingStack = ({
  hidePlayerOnEnd
}: {
  hidePlayerOnEnd: boolean;
}) => {
  const updateStack = useCallback(() => {
    const states = getAllPlayerDataState();

    const playing = states.filter(
      ({ id, isPlaying }) => isPlaying && id !== 'title'
    );

    const stopped = states.filter(
      ({ id, isPlaying }) => !isPlaying && id !== 'title'
    );

    // sort the stopped players by stoppedAt - newest first
    const sortedStopped = stopped.sort(
      (a, b) => (b.stoppedAt ?? 0) - (a.stoppedAt ?? 0)
    );

    log.debug('[updateStack] playing', playing.map(({ id }) => id).join(','));
    log.debug(
      '[updateStack] stopped',
      sortedStopped.map(({ id }) => id).join(',')
    );

    if (playing.length === 0) {
      if (sortedStopped.length > 0) {
        const lastStopped = sortedStopped[0];
        if (lastStopped.isVisible) {
          log.debug('[updateStack] lastStopped', lastStopped.id, {
            hidePlayerOnEnd
          });
          if (hidePlayerOnEnd) {
            hidePlayer(lastStopped.id);
          } else {
            // keep the last player visible
            log.debug(
              '[updateStack] keeping last player visible',
              lastStopped.id
            );
            return;
          }
        }
      }
    }

    // hide all the stopped players
    stopped.forEach(({ id }) => {
      hidePlayer(id);
    });

    // remove the title from the playing stack
    // const playingWithoutTitle = playing.filter(({ id }) => id !== 'title');

    // if there are no playing players, show the title
    if (playing.length === 0) {
      showPlayer('title');
      setPlayerDataStatePlaying('title', true);
      return;
    }

    // sort the playing players by startedAt - oldest first
    const sortedPlaying = playing.sort(
      (a, b) => (a.startedAt ?? 0) - (b.startedAt ?? 0)
    );

    // sort the playing players by priority
    const sortedPlayingByPriority = sortedPlaying.sort(
      (a, b) => (a.playPriority ?? 0) - (b.playPriority ?? 0)
    );

    // hide all the playing players apart from the last one
    sortedPlayingByPriority.slice(0, -1).forEach(({ id }) => {
      hidePlayer(id);
    });

    // show the last playing player
    showPlayer(sortedPlayingByPriority[sortedPlayingByPriority.length - 1].id);

    log.debug('updateStack: states', sortedPlayingByPriority);
  }, [hidePlayerOnEnd]);

  const getPlayersPlayingCount = useCallback(() => {
    const states = getAllPlayerDataState();

    const playing = states.filter(
      ({ id, isPlaying }) => isPlaying && id !== 'title'
    );

    return playing.length;
  }, []);

  const hideStackPlayer = useCallback(
    (hideId: string) => {
      const playersPlayingCount = getPlayersPlayingCount();

      log.debug('hideStackPlayer', { hideId, playersPlayingCount });

      setPlayerDataStatePlaying(hideId, false);

      updateStack();
    },
    [updateStack, getPlayersPlayingCount]
  );

  const showStackPlayer = useCallback(
    (player: PlayerPlaying) => {
      setPlayerData(player.padId, {
        url: player.url,
        isPlaying: true,
        chokeGroup: player.chokeGroup,
        playPriority: player.playPriority,
        startedAt: performance.now(),
        stoppedAt: undefined
      });

      updateStack();
    },
    [updateStack]
  );

  const getChokeGroupPlayers = useCallback((chokeGroup: number) => {
    const states = getAllPlayerDataState();
    const playing = states.filter(
      ({ id, isPlaying }) => isPlaying && id !== 'title'
    );

    return playing.filter(({ chokeGroup: group }) => group === chokeGroup);
  }, []);

  return {
    hideStackPlayer,
    showStackPlayer,
    getChokeGroupPlayers
  };
};
