'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
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
import { LoadingPlayer } from './LoadingPlayer';
import { Player } from './Player';
import {
  getPlayerDataState,
  hidePlayer,
  setPlayerDataState,
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

interface PlayingStack {
  id: string;
  priority: number;
}

const usePlayingStack = () => {
  const ref = useRef<PlayingStack[]>([]);

  const hideStackPlayer = useCallback((hideId: string) => {
    const stack = ref.current;
    if (stack.length > 1) {
      hidePlayer(hideId);
      ref.current = stack.filter(({ id }) => id !== hideId);
    }

    // remove the player from the stack
    setPlayerDataState(hideId, 'stopped');
  }, []);

  const showStackPlayer = useCallback(
    (showId: string, priority: number | undefined) => {
      const stack = ref.current;

      // remove players that are not playing
      const playingStack = stack.filter(({ id }) => {
        const active = getPlayerDataState(id) === 'playing';
        if (!active) {
          hidePlayer(id);
        }
        return active;
      });

      // places the new player on top of the stack
      const newStack = [
        ...playingStack.filter(({ id }) => id !== showId),
        { id: showId, priority: priority ?? 0 }
      ];

      // sort the stack by priority
      const sortedStack = newStack.sort((a, b) => a.priority - b.priority);

      // Update z-index of all players based on stack position
      sortedStack.forEach(({ id }, index) => showPlayer(id, index + 1));

      ref.current = sortedStack;
    },
    []
  );

  return { playingStackRef: ref, hideStackPlayer, showStackPlayer };
};

export const PlayerContainer = () => {
  const events = useEvents();

  const { hideStackPlayer, showStackPlayer } = usePlayingStack();

  const {
    updatePlayer: updatePlayerState,
    isLoading,
    playerReadyCount
  } = usePlayersState();
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);

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
    [events, pads]
  );

  const handlePadTouchup = useCallback(
    ({ padId }: { padId: string }) => {
      const pad = pads.find((pad) => pad.id === padId);
      if (!pad) return;
      const url = getPadSourceUrl(pad);
      if (!url) return;

      const isOneShot = getPadIsOneShot(pad);

      if (!isOneShot) {
        events.emit('video:stop', { url, padId, time: 0 });
      }
    },
    [events, pads]
  );

  const handlePlayerPlaying = useCallback(
    (e: PlayerPlaying) => {
      // log.debug('❤️ player:playing', e);

      setIsLoaderVisible(false);

      showStackPlayer(e.padId, e.playPriority);
    },
    [showStackPlayer]
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

  useEffect(() => {
    if (isLoading) {
      setIsLoaderVisible(true);
    } else {
      // setIsLoaderVisible(false);
    }
  }, [isLoading]);

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
      {isLoaderVisible && (
        <LoadingPlayer count={players.length} loadingCount={playerReadyCount} />
      )}
      {players.map((player) => {
        return (
          <Player key={player.id} {...player} data-player-id={player.padId} />
        );
      })}
    </>
  );
};
