'use client';

import { useCallback, useEffect } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { EventInputSource } from '@hooks/events/types';
import { useKeyboard } from '@hooks/useKeyboard';
import { useMidiMappingMode } from '@hooks/useMidi/selectors';
import { useSelectedPadId } from '@hooks/useProject/selectors';
import { useIsPlayEnabled } from '@hooks/useSettings';
import { usePlayersState } from '@model/hooks/usePlayersState';
import {
  getPadChokeGroup,
  getPadInterval,
  getPadIsOneShot,
  getPadLoopStart,
  getPadPlayPriority,
  getPadPlaybackRate,
  getPadPlaybackResume,
  getPadSourceUrl,
  getPadVolume,
  isPadLooped
} from '@model/pad';
import { Interval } from '@model/types';
import { Player } from './Player';
import { TitlePlayer } from './TitlePlayer';
import { showPlayer } from './helpers';
import { usePlayers } from './hooks/usePlayers';
import { usePlayingStack } from './hooks/usePlayingStack';
import {
  PlayerNotReady,
  PlayerPlaying,
  PlayerReady,
  PlayerSeek,
  PlayerStopped
} from './types';

const log = createLog('player/container ❤️', ['debug']);

export const PlayerContainer = () => {
  const events = useEvents();

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

  const { hideStackPlayer, showStackPlayer, getChokeGroupPlayers } =
    usePlayingStack({ hidePlayerOnEnd: hidePlayerOnEnd ?? false });

  const { updatePlayer: updatePlayerState, playerReadyCount } =
    usePlayersState();

  const handlePadTouchdown = useCallback(
    ({ padId, source }: { padId: string; source: EventInputSource }) => {
      const pad = pads.find((pad) => pad.id === padId);
      if (!pad) return;

      // log.debug('[handlePadTouchdown]', {
      //   padId,
      //   source,
      //   // isMidiMappingModeEnabled,
      //   // isSelectPadFromPadEnabled,
      //   // isSelectPadFromKeyboardEnabled,
      //   // isKeyboardPlayEnabled,
      //   isPadPlayEnabled,
      //   arePlayersEnabled
      // });

      if (isMidiMappingModeEnabled && source !== 'midi') {
        setSelectedPadId(padId);
        return;
      }

      if (source === 'keyboard') {
        if (!isKeyboardPlayEnabled) return;
        if (isSelectPadFromKeyboardEnabled) {
          setSelectedPadId(padId);
        }
        // prevent page reload key-combo from triggering pad
        if (isMetaKeyDown()) return;
      } else if (source === 'pad') {
        if (!isPadPlayEnabled) return;
        if (isSelectPadFromPadEnabled) {
          setSelectedPadId(padId);
        }
        // if (isPadSelectSourceDisabled) return;
      }

      if (!arePlayersEnabled) return;

      const mediaUrl = getPadSourceUrl(pad);
      if (!mediaUrl) {
        log.debug('no media url for pad', padId, pad);
        return;
      }

      const isOneShot = getPadIsOneShot(pad);
      const isLoop = isPadLooped(pad);
      const loopStart = getPadLoopStart(pad);
      const isResume = getPadPlaybackResume(pad);
      const chokeGroup = getPadChokeGroup(pad);
      const playPriority = getPadPlayPriority(pad);

      const { start, end } = getPadInterval(pad, {
        start: 0,
        end: Number.MAX_SAFE_INTEGER
      }) as Interval;
      const volume = getPadVolume(pad, 1);
      const playbackRate = getPadPlaybackRate(pad, 1);

      events.emit('video:start', {
        url: mediaUrl,
        padId: pad.id,
        isOneShot,
        isLoop,
        loopStart,
        start,
        end,
        volume,
        playbackRate,
        isResume,
        chokeGroup,
        playPriority
      });
    },
    [
      pads,
      isMidiMappingModeEnabled,
      arePlayersEnabled,
      events,
      setSelectedPadId,
      isKeyboardPlayEnabled,
      isSelectPadFromKeyboardEnabled,
      isMetaKeyDown,
      isPadPlayEnabled,
      isSelectPadFromPadEnabled
    ]
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
      if (!arePlayersEnabled) return;
      const pad = pads.find((pad) => pad.id === padId);
      if (!pad) return;
      if (source === 'keyboard' && !isKeyboardPlayEnabled) return;

      const url = getPadSourceUrl(pad);
      if (!url) return;

      const isOneShot = getPadIsOneShot(pad);

      if (!isOneShot || forceStop) {
        events.emit('video:stop', {
          url,
          padId,
          time: 0,
          requestId: 'players-!isOneShot||forceStop'
        });
      }
    },
    [events, pads, arePlayersEnabled, isKeyboardPlayEnabled]
  );

  const handlePlayerPlaying = useCallback(
    (e: PlayerPlaying) => {
      const { chokeGroup } = e;

      if (chokeGroup !== undefined) {
        // for (const player of players) {
        //   if (player.padId === e.padId) continue;
        //   if (player.chokeGroup === chokeGroup) {
        //     log.debug('ChokeGroupPlayers: stopping player', player);
        //     // events.emit('video:stop', { url: player.url, padId: player.padId, time: 0 });
        //   }
        // }

        // stop all players in the same choke group
        const cgPlayers = getChokeGroupPlayers(chokeGroup);
        cgPlayers.forEach((player) => {
          const { url, id } = player;
          if (id === e.padId) return;
          log.debug('ChokeGroupPlayers: stopping player', player);
          events.emit('video:stop', {
            url,
            padId: id,
            time: 0,
            requestId: 'players-chokeGroup'
          });
        });
      }

      showStackPlayer(e);
    },
    [showStackPlayer, getChokeGroupPlayers, events]
  );

  const handlePlayerStopped = useCallback(
    (e: PlayerStopped) => {
      hideStackPlayer(e.padId);
    },
    [hideStackPlayer]
  );

  const handlePlayerSeek = useCallback((e: PlayerSeek) => {
    showPlayer(e.padId);
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

    // window.getPlayerElements = () => getPlayerElements();

    events.on('pad:touchdown', handlePadTouchdown);
    events.on('pad:touchup', handlePadTouchup);
    events.on('player:playing', handlePlayerPlaying);
    events.on('player:stopped', handlePlayerStopped);
    events.on('video:seek', handlePlayerSeek);
    events.on('player:ready', handlePlayerReady);
    events.on('player:not-ready', handlePlayerNotReady);
    return () => {
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
