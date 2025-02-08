'use client';

import { useCallback, useEffect } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { useProject } from '@hooks/useProject';
import { usePlayersState } from '@model/hooks/usePlayersState';
import {
  useSettingIsKeyboardPlayEnabled,
  useSettingIsPadPlayEnabled,
  useSettingSelectPadFromKeyboard,
  useSettingSelectPadFromPad
} from '@model/hooks/useSettings';
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
import { useSelectedPadId } from '../../model/store/selectors';
import { LoadingPlayer } from './LoadingPlayer';
import { Player } from './Player';
import { hidePlayer, showPlayer } from './helpers';
import { usePlayers } from './hooks/usePlayers';
import { usePlayingStack } from './hooks/usePlayingStack';
import {
  PlayerNotReady,
  PlayerPlaying,
  PlayerReady,
  PlayerSeek,
  PlayerStopped
} from './types';

const log = createLog('player/container', ['debug']);

export const PlayerContainer = () => {
  const events = useEvents();
  const { project } = useProject();
  const isKeyboardPlayEnabled = useSettingIsKeyboardPlayEnabled(project);
  const isPadPlayEnabled = useSettingIsPadPlayEnabled(project);
  const selectPadFromKeyboard = useSettingSelectPadFromKeyboard(project);
  const selectPadFromPad = useSettingSelectPadFromPad(project);
  const { setSelectedPadId } = useSelectedPadId();

  const { pads, players } = usePlayers();

  const { hideStackPlayer, showStackPlayer, getChokeGroupPlayers } =
    usePlayingStack();

  const { updatePlayer: updatePlayerState, playerReadyCount } =
    usePlayersState();

  const handlePadTouchdown = useCallback(
    ({ padId, source }: { padId: string; source: string }) => {
      const pad = pads.find((pad) => pad.id === padId);
      if (!pad) return;

      if (source === 'keyboard') {
        if (!isKeyboardPlayEnabled) return;
        if (selectPadFromKeyboard) {
          setSelectedPadId(padId);
        }
      } else if (source === 'pad') {
        if (!isPadPlayEnabled) return;
        if (selectPadFromPad) {
          setSelectedPadId(padId);
        }
      }

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
    [events, pads, isKeyboardPlayEnabled]
  );

  const handlePadTouchup = useCallback(
    ({ padId, source }: { padId: string; source: string }) => {
      const pad = pads.find((pad) => pad.id === padId);
      if (!pad) return;
      if (source === 'keyboard' && !isKeyboardPlayEnabled) return;

      const url = getPadSourceUrl(pad);
      if (!url) return;

      const isOneShot = getPadIsOneShot(pad);

      if (!isOneShot) {
        events.emit('video:stop', { url, padId, time: 0 });
      }
    },
    [events, pads, isKeyboardPlayEnabled]
  );

  const handlePlayerPlaying = useCallback(
    (e: PlayerPlaying) => {
      const { chokeGroup } = e;

      if (chokeGroup !== undefined) {
        // stop all players in the same choke group
        const players = getChokeGroupPlayers(chokeGroup);
        players.forEach((player) => {
          const { url, padId } = player;
          if (padId === e.padId) return;
          events.emit('video:stop', { url, padId, time: 0 });
        });
      }

      showStackPlayer(e);
    },
    [events, showStackPlayer, getChokeGroupPlayers]
  );

  const handlePlayerStopped = useCallback(
    (e: PlayerStopped) => {
      // log.debug('❤️ player:stopped', e);

      hideStackPlayer(e.padId);
    },
    [hideStackPlayer]
  );

  const handlePlayerSeek = useCallback((e: PlayerSeek) => {
    showPlayer(e.padId);
  }, []);

  const handlePlayerReady = useCallback(
    (e: PlayerReady) => {
      log.debug('❤️ player:ready', e);
      updatePlayerState({ padId: e.padId, mediaUrl: e.url, isReady: true });
    },
    [updatePlayerState]
  );

  const handlePlayerNotReady = useCallback(
    (e: PlayerNotReady) => {
      log.debug('❤️ player:not-ready', e);
      hidePlayer(e.padId);
      updatePlayerState({ padId: e.padId, mediaUrl: e.url, isReady: false });
    },
    [updatePlayerState]
  );

  useEffect(() => {
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

  // useRenderingTrace('PlayerContainer', {
  //   pads,
  //   players,
  //   events,
  //   store,
  //   padUrlStr
  // });

  return (
    <>
      <LoadingPlayer count={players.length} loadingCount={playerReadyCount} />

      {players.map((player) => {
        return (
          <Player key={player.id} {...player} data-player-id={player.padId} />
        );
      })}
    </>
  );
};
