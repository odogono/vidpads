import { PlayerPlaying, PlayerStopped } from '../types';
import { PlaybackCommand } from './commands';

export interface PlaybackRuntimePlayer {
  id: string;
  isPlaying: boolean;
  url?: string;
  chokeGroup?: number;
  playPriority?: number;
  startedAt?: number;
  stoppedAt?: number;
  isOneShot?: boolean;
  isLoop?: boolean;
  isResume?: boolean;
  isVisible?: boolean;
  zIndex?: number;
  opacity?: number;
  pointerEvents?: string;
}

export interface PlaybackRuntimeState {
  players: PlaybackRuntimePlayer[];
}

export interface PlaybackStackDecision {
  showPlayerIds: string[];
  hidePlayerIds: string[];
  stopCommands: PlaybackCommand[];
  playingCount: number;
  stoppedCount: number;
  lastPlayerId?: string;
  keepLastPlayerVisibleId?: string;
  shouldScheduleLastPlayerHide: boolean;
}

export interface PlaybackStackResult {
  state: PlaybackRuntimeState;
  decision: PlaybackStackDecision;
}

const TITLE_PLAYER_ID = 'title';

export const handlePlaybackStarted = (
  state: PlaybackRuntimeState,
  player: PlayerPlaying,
  now: number = performance.now()
): PlaybackStackResult => {
  const stopCommands = getChokeGroupStopCommands(state, player);
  const nextState = updatePlayer(state, player.padId, {
    url: player.url,
    isPlaying: true,
    chokeGroup: player.chokeGroup,
    playPriority: player.playPriority,
    startedAt: now,
    stoppedAt: undefined,
    isOneShot: player.isOneShot,
    isLoop: player.isLoop,
    isResume: player.isResume
  });
  const result = applyStackRules(nextState, { hidePlayerOnEnd: true });

  return {
    state: result.state,
    decision: {
      ...result.decision,
      stopCommands
    }
  };
};

export const handlePlaybackStopped = (
  state: PlaybackRuntimeState,
  player: PlayerStopped,
  options: { hidePlayerOnEnd: boolean; overrideKeepLastPlayerVisible?: boolean },
  now: number = performance.now()
): PlaybackStackResult => {
  const nextState = updatePlayer(state, player.padId, {
    isPlaying: false,
    stoppedAt: now
  });

  return applyStackRules(nextState, options);
};

export const forceHidePlayer = (
  state: PlaybackRuntimeState,
  playerId: string
): PlaybackStackResult => {
  const nextState = updatePlayer(state, playerId, {
    isPlaying: false,
    isVisible: false,
    opacity: 0,
    zIndex: 0,
    pointerEvents: 'none'
  });

  return applyStackRules(nextState, {
    hidePlayerOnEnd: true,
    overrideKeepLastPlayerVisible: true
  });
};

export const applyStackRules = (
  state: PlaybackRuntimeState,
  {
    hidePlayerOnEnd,
    overrideKeepLastPlayerVisible = false
  }: { hidePlayerOnEnd: boolean; overrideKeepLastPlayerVisible?: boolean }
): PlaybackStackResult => {
  const padPlayers = getPadPlayers(state);
  const playing = padPlayers.filter((player) => player.isPlaying);
  const stopped = padPlayers.filter((player) => !player.isPlaying);
  const sortedStopped = [...stopped].sort(
    (a, b) => (b.stoppedAt ?? 0) - (a.stoppedAt ?? 0)
  );
  const baseDecision = createDecision({
    playingCount: playing.length,
    stoppedCount: stopped.length
  });

  if (playing.length === 0) {
    const lastStopped = sortedStopped[0];
    if (
      lastStopped?.isVisible &&
      !hidePlayerOnEnd &&
      !overrideKeepLastPlayerVisible
    ) {
      return {
        state,
        decision: {
          ...baseDecision,
          showPlayerIds: [lastStopped.id],
          lastPlayerId: lastStopped.id,
          keepLastPlayerVisibleId: lastStopped.id,
          shouldScheduleLastPlayerHide: true
        }
      };
    }

    const hidePlayerIds = stopped.map((player) => player.id);
    const stateWithStoppedHidden = hidePlayers(state, hidePlayerIds);
    const stateWithTitle = showRuntimePlayer(
      updatePlayer(stateWithStoppedHidden, TITLE_PLAYER_ID, { isPlaying: true }),
      TITLE_PLAYER_ID
    );

    return {
      state: stateWithTitle,
      decision: {
        ...baseDecision,
        showPlayerIds: [TITLE_PLAYER_ID],
        hidePlayerIds,
        lastPlayerId: undefined
      }
    };
  }

  const sortedPlayingByPriority = [...playing].sort(
    (a, b) => (a.playPriority ?? 0) - (b.playPriority ?? 0)
  );
  const visiblePlayer = sortedPlayingByPriority.at(-1);
  const hidePlayingIds = sortedPlayingByPriority
    .slice(0, -1)
    .map((player) => player.id);
  const hidePlayerIds = [
    ...stopped.map((player) => player.id),
    ...hidePlayingIds
  ];
  const stateWithHidden = hidePlayers(state, hidePlayerIds);
  const nextState = visiblePlayer
    ? showRuntimePlayer(stateWithHidden, visiblePlayer.id)
    : stateWithHidden;

  return {
    state: nextState,
    decision: {
      ...baseDecision,
      showPlayerIds: visiblePlayer ? [visiblePlayer.id] : [],
      hidePlayerIds,
      lastPlayerId: visiblePlayer?.id
    }
  };
};

const getChokeGroupStopCommands = (
  state: PlaybackRuntimeState,
  player: PlayerPlaying
): PlaybackCommand[] => {
  if (player.chokeGroup === undefined) {
    return [];
  }

  return getPadPlayers(state)
    .filter(
      (candidate) =>
        candidate.isPlaying &&
        candidate.id !== player.padId &&
        candidate.chokeGroup === player.chokeGroup
    )
    .map((candidate) => ({
      type: 'video:stop',
      payload: {
        url: candidate.url ?? '',
        padId: candidate.id,
        time: 0,
        requestId: 'players-chokeGroup'
      }
    }));
};

const getPadPlayers = (state: PlaybackRuntimeState) =>
  state.players.filter((player) => player.id !== TITLE_PLAYER_ID);

const createDecision = ({
  playingCount,
  stoppedCount
}: {
  playingCount: number;
  stoppedCount: number;
}): PlaybackStackDecision => ({
  showPlayerIds: [],
  hidePlayerIds: [],
  stopCommands: [],
  playingCount,
  stoppedCount,
  shouldScheduleLastPlayerHide: false
});

const updatePlayer = (
  state: PlaybackRuntimeState,
  playerId: string,
  updates: Partial<PlaybackRuntimePlayer>
): PlaybackRuntimeState => ({
  players: state.players.map((player) =>
    player.id === playerId ? { ...player, ...updates } : player
  )
});

const hidePlayers = (
  state: PlaybackRuntimeState,
  playerIds: string[]
): PlaybackRuntimeState =>
  playerIds.reduce(
    (currentState, playerId) => hideRuntimePlayer(currentState, playerId),
    state
  );

const hideRuntimePlayer = (
  state: PlaybackRuntimeState,
  playerId: string
): PlaybackRuntimeState =>
  updatePlayer(state, playerId, {
    isVisible: false,
    opacity: 0,
    zIndex: 0,
    pointerEvents: 'none'
  });

const showRuntimePlayer = (
  state: PlaybackRuntimeState,
  playerId: string
): PlaybackRuntimeState =>
  updatePlayer(state, playerId, {
    isVisible: true,
    opacity: 1,
    zIndex: 1,
    pointerEvents: 'auto'
  });

