import { useCallback } from 'react';

import { createLog } from '@helpers/log';
import {
  getAllPlayerDataState,
  hidePlayer,
  setPlayerData,
  showPlayer
} from '../helpers';
import {
  PlaybackRuntimeState,
  PlaybackStackDecision,
  forceHidePlayer,
  handlePlaybackStarted,
  handlePlaybackStopped
} from '../playbackEngine/stack';
import { PlayerPlaying } from '../types';

const log = createLog('usePlayingStack', ['debug']);

export const usePlayingStack = ({
  hidePlayerOnEnd
}: {
  hidePlayerOnEnd: boolean;
}) => {
  const hideStackPlayer = useCallback(
    (hideId: string, overrideKeepLastPlayerVisible: boolean = false) => {
      const state = readPlaybackRuntimeState();
      const player = state.players.find(({ id }) => id === hideId);
      const result = overrideKeepLastPlayerVisible
        ? forceHidePlayer(state, hideId)
        : handlePlaybackStopped(
            state,
            { url: player?.url ?? '', padId: hideId, time: 0 },
            { hidePlayerOnEnd, overrideKeepLastPlayerVisible }
          );

      syncPlaybackRuntimeState(state, result.state);
      applyStackDecision(result.decision);

      log.debug('hideStackPlayer', {
        hideId,
        playersPlayingCount: result.decision.playingCount
      });

      return {
        playing: result.decision.playingCount,
        stopped: result.decision.stoppedCount,
        lastId: result.decision.lastPlayerId,
        stopCommands: result.decision.stopCommands
      };
    },
    [hidePlayerOnEnd]
  );

  const showStackPlayer = useCallback(
    (player: PlayerPlaying) => {
      const before = readPlaybackRuntimeState();
      const result = handlePlaybackStarted(before, player);

      syncPlaybackRuntimeState(before, result.state);
      applyStackDecision(result.decision);

      return {
        playing: result.decision.playingCount,
        stopped: result.decision.stoppedCount,
        lastId: result.decision.lastPlayerId,
        stopCommands: result.decision.stopCommands
      };
    },
    []
  );

  return {
    hideStackPlayer,
    showStackPlayer
  };
};

const readPlaybackRuntimeState = (): PlaybackRuntimeState => ({
  players: getAllPlayerDataState()
});

const syncPlaybackRuntimeState = (
  before: PlaybackRuntimeState,
  after: PlaybackRuntimeState
) => {
  const beforeById = new Map(before.players.map((p) => [p.id, p]));
  after.players.forEach((player) => {
    if (beforeById.get(player.id) === player) return;
    setPlayerData(player.id, {
      url: player.url ?? '',
      isPlaying: player.isPlaying,
      chokeGroup: player.chokeGroup,
      playPriority: player.playPriority,
      startedAt: player.startedAt,
      stoppedAt: player.stoppedAt,
      isOneShot: player.isOneShot,
      isLoop: player.isLoop,
      isResume: player.isResume
    });
  });
};

const applyStackDecision = (decision: PlaybackStackDecision) => {
  decision.hidePlayerIds.forEach((id) => {
    hidePlayer(id);
  });
  decision.showPlayerIds.forEach((id) => {
    showPlayer(id);
  });
};
