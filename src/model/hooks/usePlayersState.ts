import { useCallback } from 'react';

import { isObjectEqual } from '@helpers/diff';
import { createLog } from '@helpers/log';
import { isYouTubeMetadata } from '@helpers/metadata';
import { VOKeys } from '@model/constants';
import {
  getMediaData as dbGetMediaData,
  updateMetadataProperty as dbUpdateMetadataProperty
} from '@model/db/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MediaYouTube } from '../types';

export interface PlayerHandler {
  padId: string;
  mediaUrl: string;
  isReady: boolean;
  duration: number;
  playbackRates: number[];
}

type PlayerMap = Map<string, PlayerHandler>;

const defaultPlayer: PlayerHandler = {
  padId: '',
  mediaUrl: '',
  isReady: false,
  duration: -1,
  playbackRates: []
};

const log = createLog('model/hooks/usePlayersState', ['debug']);

export const usePlayerState = (padId?: string, mediaUrl?: string) => {
  const queryClient = useQueryClient();
  const playerId = padId; // toPlayerId(padId, mediaUrl);

  const { data: player } = useQuery({
    queryKey: VOKeys.player(playerId ?? 'unknown'),
    queryFn: async () => {
      if (!mediaUrl) return defaultPlayer;
      if (!playerId) return defaultPlayer;

      log.debug('querying player', playerId);
      const media = (await dbGetMediaData(mediaUrl)) ?? undefined;
      const players = queryClient.getQueryData(VOKeys.players()) as PlayerMap;
      const player = players.get(playerId);
      const duration = media?.duration ?? -1;
      const playbackRates = isYouTubeMetadata(media)
        ? (media as MediaYouTube).playbackRates
        : [];
      return { ...defaultPlayer, ...player, duration, playbackRates };
    },
    enabled: !!playerId
  });

  const { mutate: mutatePlayer } = useMutation({
    mutationKey: VOKeys.updatePlayer(playerId ?? 'unknown'),
    mutationFn: (updatedPlayer: Partial<PlayerHandler>) => {
      log.debug('[mutatePlayer]', 'update', { player, updatedPlayer });
      return applyPlayerUpdate(player, updatedPlayer);
    },
    onSuccess: (player: PlayerHandler) => {
      if (!playerId) return;
      queryClient.setQueryData(VOKeys.player(playerId), player);

      queryClient.setQueryData(VOKeys.players(), (previous: PlayerMap) => {
        const newMap = new Map(previous);
        newMap.set(playerId, player);

        return newMap;
      });
    }
  });

  const { mutate: destroyPlayer } = useMutation({
    mutationKey: VOKeys.deletePlayer(playerId ?? 'unknown'),
    mutationFn: () => {
      return Promise.resolve(defaultPlayer);
    },
    onSuccess: () => {
      if (!playerId) return;
      queryClient.invalidateQueries({
        queryKey: VOKeys.player(playerId)
      });
      queryClient.setQueryData(VOKeys.players(), (old: PlayerMap) => {
        const newMap = new Map(old);
        newMap.delete(playerId);
        return newMap;
      });
    }
  });

  const onPlayerUpdate = useCallback(
    (player: Partial<PlayerHandler>) => {
      if (!playerId) return;
      mutatePlayer(player);
    },
    [mutatePlayer, playerId]
  );

  // const onPlayerDestroyed = useCallback(() => {
  //   queryClient.setQueryData(VOKeys.players(), (old: PlayerMap) => {
  //     const newMap = new Map(old);
  //     newMap.delete(playerId);
  //     return newMap;
  //   });
  //   queryClient.invalidateQueries({
  //     queryKey: VOKeys.player(playerId)
  //   });
  // }, [queryClient, playerId]);

  return {
    player: player ?? { ...defaultPlayer, padId, mediaUrl },
    onPlayerUpdate,
    onPlayerDestroyed: destroyPlayer
  };
};

export const usePlayersState = () => {
  const queryClient = useQueryClient();

  const { data: players } = useQuery({
    queryKey: VOKeys.players(),
    queryFn: () => {
      return new Map<string, PlayerHandler>();
    },
    initialData: new Map<string, PlayerHandler>()
  });

  const { mutateAsync: updatePlayer } = useMutation({
    mutationKey: VOKeys.updatePlayer('unknown'),
    mutationFn: (updatedPlayer: Partial<PlayerHandler>) => {
      log.debug('[mutatePlayer]', 'update', updatedPlayer);
      const { padId } = updatedPlayer;
      log.debug('[mutatePlayer]', 'padId', padId);
      if (!padId) throw new Error('PadId is required');

      const player = players.get(padId);
      log.debug('[mutatePlayer]', 'player', { padId }, player);
      if (!player) throw new Error('Player not found');
      return applyPlayerUpdate(player, updatedPlayer);
    },
    onSuccess: (player: PlayerHandler) => {
      if (!player) return;
      queryClient.setQueryData(VOKeys.player(player.padId), player);

      queryClient.setQueryData(VOKeys.players(), (previous: PlayerMap) => {
        const newMap = new Map(previous);
        newMap.set(player.padId, player);

        return newMap;
      });
    }
  });

  // const onPlayerUpdate = useCallback(
  //   (player: PlayerHandler) => {
  //     const playerId = toPlayerId(player.padId, player.mediaUrl);

  //     queryClient.setQueryData(VOKeys.players(), (old: PlayerMap) => {
  //       const newMap = new Map(old);
  //       const existingPlayer = newMap.get(playerId);
  //       const newPlayer = { ...defaultPlayer, ...existingPlayer, ...player };
  //       newMap.set(playerId, newPlayer);
  //       return newMap;
  //     });

  //     queryClient.invalidateQueries({
  //       queryKey: VOKeys.player(playerId)
  //     });
  //   },
  //   [queryClient]
  // );

  // const onPlayerDestroyed = useCallback(
  //   (player: PlayerHandler) => {
  //     const playerId = toPlayerId(player.padId, player.mediaUrl);
  //     queryClient.setQueryData(VOKeys.players(), (old: PlayerMap) => {
  //       const newMap = new Map(old);
  //       newMap.delete(playerId);
  //       return newMap;
  //     });
  //     queryClient.invalidateQueries({
  //       queryKey: VOKeys.player(playerId)
  //     });
  //   },
  //   [queryClient]
  // );

  return {
    updatePlayer,
    players
  };
};

const applyPlayerUpdate = async (
  player: PlayerHandler | undefined,
  updatedPlayer: Partial<PlayerHandler>
): Promise<PlayerHandler> => {
  if (!player) throw new Error('Player not found');
  const { mediaUrl, padId } = { ...player, ...updatedPlayer };

  if (!mediaUrl)
    log.debug('[mutatePlayer]', 'no mediaUrl', { ...player, ...updatedPlayer });
  if (!padId)
    log.debug('[mutatePlayer]', 'no padId', { ...player, ...updatedPlayer });

  if (player?.duration === -1 && updatedPlayer.duration !== -1) {
    log.debug('[mutatePlayer]', 'updated duration', updatedPlayer.duration);
    await dbUpdateMetadataProperty(
      mediaUrl,
      'duration',
      updatedPlayer.duration
    );
  }
  if (
    player?.playbackRates &&
    updatedPlayer.playbackRates &&
    !isObjectEqual(player?.playbackRates, updatedPlayer.playbackRates)
  ) {
    log.debug(
      '[mutatePlayer]',
      'updated playbackRates',
      updatedPlayer.playbackRates
    );
    await dbUpdateMetadataProperty(
      mediaUrl,
      'playbackRates',
      updatedPlayer.playbackRates
    );
  }

  const newPlayer: PlayerHandler = {
    ...player,
    ...updatedPlayer
  } as PlayerHandler;
  // log.debug('mutatePlayer', newPlayer);
  return Promise.resolve(newPlayer);
};
