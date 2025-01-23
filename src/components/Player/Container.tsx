'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { usePlayersState } from '@model/hooks/usePlayersState';
import {
  getPadPlaybackRate,
  getPadSourceUrl,
  getPadStartAndEndTime,
  getPadVolume
} from '@model/pad';
import { Interval } from '@model/types';
import { useQueryClient } from '@tanstack/react-query';
import { Player } from './Player';
import {
  getPlayerDataState,
  hidePlayer,
  setPlayerDataState,
  setPlayerReadyInCache,
  setPlayerZIndex,
  showPlayer
} from './helpers';
import {
  PlayerNotReady,
  PlayerPlaying,
  PlayerReady,
  PlayerSeek,
  PlayerStopped
} from './types';
import { usePlayers } from './usePlayers';

const log = createLog('player/container');

export const PlayerContainer = () => {
  const events = useEvents();
  const playingStackRef = useRef<string[]>([]);
  const queryClient = useQueryClient();
  const { players: playersState } = usePlayersState();

  const { pads, players } = usePlayers();

  const handlePadTouchdown = useCallback(
    ({ padId }: { padId: string }) => {
      const pad = pads.find((pad) => pad.id === padId);
      if (!pad) return;

      const mediaUrl = getPadSourceUrl(pad);
      if (!mediaUrl) {
        log.debug('no media url for pad', padId, pad);
        return;
      }

      const isOneShot = pad.isOneShot ?? false;
      const isLoop = pad.isLooped ?? false;
      const { start, end } = getPadStartAndEndTime(pad, {
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
        start,
        end,
        volume,
        playbackRate
      });
    },
    [events, pads]
  );

  const handlePadTouchup = useCallback(
    ({ padId }: { padId: string }) => {
      const pad = pads.find((pad) => pad.id === padId);
      if (!pad) return;
      const url = getPadSourceUrl(pad);
      if (!url) return;

      const isOneShot = pad.isOneShot ?? false;

      if (!isOneShot) {
        events.emit('video:stop', { url, padId, time: 0 });
      }
    },
    [events, pads]
  );

  const handlePlayerPlaying = useCallback((e: PlayerPlaying) => {
    // log.debug('❤️ player:playing', e);

    showPlayer(e.padId);

    const stack = playingStackRef.current;

    // remove stopped state players
    const playingStack = stack.filter((id) => {
      const active = getPlayerDataState(id) === 'playing';
      if (!active) {
        hidePlayer(id);
      }
      return active;
    });

    const newStack = [...playingStack.filter((id) => id !== e.padId), e.padId];

    // Update z-index of all players based on stack position
    newStack.forEach((id, index) => setPlayerZIndex(id, index + 1));

    // log.debug('stack players:', newStack.length);
    // for (const index in players) {
    //   const id = players[index].padId;
    //   const playerElement = getPlayerElement(id);
    //   const zIndex = playerElement?.style.zIndex;
    //   const opacity = playerElement?.style.opacity;
    //   const state = playerElement?.dataset.state;
    //   const stackp = newStack.indexOf(id);
    //   log.debug('player', { id, zIndex, opacity, state, stackp });
    // }

    playingStackRef.current = newStack;
  }, []);

  const handlePlayerStopped = useCallback((e: PlayerStopped) => {
    // log.debug('❤️ player:stopped', e);

    const stack = playingStackRef.current;

    if (stack.length > 1) {
      hidePlayer(e.padId);
      const newStack = stack.filter((id) => id !== e.padId);
      playingStackRef.current = newStack;
    } else {
      setPlayerDataState(e.padId, 'stopped');
    }
  }, []);

  const handlePlayerSeek = useCallback((e: PlayerSeek) => {
    // log.debug('❤️ player:seek', e);

    showPlayer(e.padId);
  }, []);

  const handlePlayerReady = useCallback(
    (e: PlayerReady) => {
      log.debug('❤️ player:ready', e);
      setPlayerReadyInCache(queryClient, e.url, e.padId, true);
    },
    [queryClient]
  );

  useEffect(() => {
    for (const player of playersState.values()) {
      log.debug('❤️ player:ready cache', player);
    }
  }, [playersState]);

  const handlePlayerNotReady = useCallback(
    (e: PlayerNotReady) => {
      log.debug('❤️ player:not-ready', e);
      hidePlayer(e.padId);
      setPlayerReadyInCache(queryClient, e.url, e.padId, false);
    },
    [queryClient]
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
      {players.map((player) => {
        return (
          <Player key={player.id} {...player} data-player-id={player.padId} />
        );
      })}
    </>
  );
};
