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
import { invalidateQueryKeys } from '../../helpers/query';
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

const log = createLog('usePlayerState');

export const usePlayerState = (padId: string, mediaUrl?: string) => {
  const queryClient = useQueryClient();
  const playerId = padId;

  // log.debug('usePlayerState', { padId, mediaUrl, playerId });

  const { data: player } = useQuery({
    queryKey: VOKeys.player(playerId),
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
    mutationKey: VOKeys.updatePlayer(playerId),
    mutationFn: (updatedPlayer: Partial<PlayerHandler>) => {
      log.debug('[mutatePlayer]', 'update', {
        playerId,
        player,
        updatedPlayer
      });
      return applyPlayerUpdate(player, updatedPlayer);
    },
    onError: (error) => {
      log.debug('[mutatePlayer] error', error.message);
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

  return {
    player: player ?? { ...defaultPlayer, padId, mediaUrl },
    onPlayerUpdate,
    onPlayerDestroyed: destroyPlayer
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
