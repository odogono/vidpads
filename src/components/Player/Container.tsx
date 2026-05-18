'use client';

import { useCallback, useEffect, useRef } from 'react';

import { createLog } from '@helpers/log';
import { TimeoutId, clearRunAfter, runAfter } from '@helpers/time';
import { useEvents } from '@hooks/events';
import { EventInputSource } from '@hooks/events/types';
import { useKeyboard } from '@hooks/useKeyboard';
import { useMidiMappingMode } from '@hooks/useMidi/selectors';
import { useSelectedPadId } from '@hooks/useProject/selectors';
import { useIsPlayEnabled } from '@hooks/useSettings';
import { usePlayersState } from '@model/hooks/usePlayersState';
import { Player } from './Player';
import { TitlePlayer } from './TitlePlayer';
import { showPlayer } from './helpers';
import { usePlayers } from './hooks/usePlayers';
import { usePlayingStack } from './hooks/usePlayingStack';
import {
  PlaybackCommand,
  resolvePlaybackInput
} from './playbackEngine/commands';
import {
  PlayerNotReady,
  PlayerPlaying,
  PlayerReady,
  PlayerSeek,
  PlayerStopped
} from './types';

const log = createLog('player/container ❤️', ['debug']);

// after the last player has stopped, display the title after
// this many seconds
const HIDE_LAST_PLAYER_TIMEOUT = 10 * 1000;

export const PlayerContainer = () => {
  const events = useEvents();
  const hideLastPlayerTimeoutRef = useRef<TimeoutId | undefined>(undefined);

  const {
    arePlayersEnabled,
    isKeyboardPlayEnabled,
    isPadPlayEnabled,
    isSelectPadFromKeyboardEnabled,
    isSelectPadFromPadEnabled,
    hidePlayerOnEnd
  } = useIsPlayEnabled();
  const { isMidiMappingModeEnabled } = useMidiMappingMode();
  const { isMetaKeyDown } = useKeyboard();

  const { setSelectedPadId } = useSelectedPadId();

  const { pads, players } = usePlayers();

  const buildPlaybackSettings = useCallback(
    () => ({
      arePlayersEnabled,
      isKeyboardPlayEnabled: isKeyboardPlayEnabled ?? false,
      isPadPlayEnabled: isPadPlayEnabled ?? false,
      isSelectPadFromKeyboardEnabled: isSelectPadFromKeyboardEnabled ?? false,
      isSelectPadFromPadEnabled: isSelectPadFromPadEnabled ?? false,
      isMidiMappingModeEnabled,
      isMetaKeyDown: isMetaKeyDown()
    }),
    [
      arePlayersEnabled,
      isKeyboardPlayEnabled,
      isPadPlayEnabled,
      isSelectPadFromKeyboardEnabled,
      isSelectPadFromPadEnabled,
      isMidiMappingModeEnabled,
      isMetaKeyDown
    ]
  );

  const { hideStackPlayer, showStackPlayer } = usePlayingStack({
    hidePlayerOnEnd: hidePlayerOnEnd ?? false
  });

  const { updatePlayer: updatePlayerState, playerReadyCount } =
    usePlayersState();

  const handlePadTouchdown = useCallback(
    ({ padId, source }: { padId: string; source: EventInputSource }) => {
      const pad = pads.find((pad) => pad.id === padId);

      const decision = resolvePlaybackInput({
        event: { type: 'pad:touchdown', padId, source },
        pad,
        settings: buildPlaybackSettings()
      });

      if (decision.selectPadId) {
        setSelectedPadId(decision.selectPadId);
      }
      if (decision.command) {
        log.debug('❤️ playback command', decision.command);
        emitPlaybackCommand(events.emit, decision.command);
      }
    },
    [pads, events, setSelectedPadId, buildPlaybackSettings]
  );

  const handlePadTouchup = useCallback(
    ({
      padId,
      source,
      forceStop
    }: {
      padId: string;
      source: string;
      forceStop?: boolean;
    }) => {
      const pad = pads.find((pad) => pad.id === padId);

      const decision = resolvePlaybackInput({
        event: { type: 'pad:touchup', padId, source, forceStop },
        pad,
        settings: buildPlaybackSettings()
      });

      if (decision.command) {
        emitPlaybackCommand(events.emit, decision.command);
      }
    },
    [events.emit, pads, buildPlaybackSettings]
  );

  const handlePlayerPlaying = useCallback(
    (e: PlayerPlaying) => {
      const { stopCommands } = showStackPlayer(e);
      stopCommands.forEach((command) => {
        emitPlaybackCommand(events.emit, command);
      });
      clearRunAfter(hideLastPlayerTimeoutRef.current);

      log.debug('player:playing', e);
    },
    [showStackPlayer, events.emit]
  );

  const handlePlayerStopped = useCallback(
    (e: PlayerStopped) => {
      const { playing, lastId } = hideStackPlayer(e.padId);

      if (playing === 0 && !hidePlayerOnEnd && lastId) {
        clearRunAfter(hideLastPlayerTimeoutRef.current);
        hideLastPlayerTimeoutRef.current = runAfter(
          HIDE_LAST_PLAYER_TIMEOUT,
          () => {
            hideStackPlayer(lastId, true);
          }
        );
      }

      log.debug('player:stopped', { playing, lastId }, e);
    },
    [hideStackPlayer, hidePlayerOnEnd]
  );

  const handlePlayerSeek = useCallback((e: PlayerSeek) => {
    showPlayer(e.padId);
    log.debug('player:seek', e);
  }, []);

  const handlePlayerReady = useCallback(
    (e: PlayerReady) => {
      log.debug('player:ready', e);
      updatePlayerState({ padId: e.padId, mediaUrl: e.url, isReady: true });
    },
    [updatePlayerState]
  );

  const handlePlayerNotReady = useCallback(
    (e: PlayerNotReady) => {
      log.debug('player:not-ready', e);
      hideStackPlayer(e.padId);
      updatePlayerState({ padId: e.padId, mediaUrl: e.url, isReady: false });
    },
    [updatePlayerState, hideStackPlayer]
  );

  useEffect(() => {
    showPlayer('title');

    events.on('pad:touchdown', handlePadTouchdown);
    events.on('pad:touchup', handlePadTouchup);
    events.on('player:playing', handlePlayerPlaying);
    events.on('player:stopped', handlePlayerStopped);
    events.on('video:seek', handlePlayerSeek);
    events.on('player:ready', handlePlayerReady);
    events.on('player:not-ready', handlePlayerNotReady);
    return () => {
      clearRunAfter(hideLastPlayerTimeoutRef.current);
      events.off('pad:touchdown', handlePadTouchdown);
      events.off('pad:touchup', handlePadTouchup);
      events.off('player:playing', handlePlayerPlaying);
      events.off('player:stopped', handlePlayerStopped);
      events.off('video:seek', handlePlayerSeek);
      events.off('player:ready', handlePlayerReady);
      events.off('player:not-ready', handlePlayerNotReady);
    };
  }, [
    events,
    handlePadTouchdown,
    handlePadTouchup,
    handlePlayerPlaying,
    handlePlayerStopped,
    handlePlayerSeek,
    handlePlayerReady,
    handlePlayerNotReady
  ]);

  return (
    <>
      <TitlePlayer
        key='player-title'
        count={players.length}
        loadingCount={playerReadyCount}
      />
      {players.map((player) => (
        <Player key={player.id} {...player} data-player-id={player.padId} />
      ))}
    </>
  );
};

const emitPlaybackCommand = (
  emit: ReturnType<typeof useEvents>['emit'],
  command: PlaybackCommand
) => {
  if (command.type === 'video:start') {
    emit('video:start', command.payload);
    return;
  }

  emit('video:stop', command.payload);
};
