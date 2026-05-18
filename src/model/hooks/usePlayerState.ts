import { useCallback } from 'react';

import { createLog } from '@helpers/log';
import { isYouTubeMetadata } from '@helpers/metadata';
import { VOKeys } from '@model/constants';
import { getMediaData as dbGetMediaData } from '@model/db/api';
import { MediaYouTube, PlayerHandler, PlayerMap } from '@model/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applyPlayerUpdate } from './playerStateUpdate';

const defaultPlayer: PlayerHandler = {
  padId: '',
  mediaUrl: '',
  isReady: false,
  isError: false,
  duration: -1,
  playbackRates: []
};

const log = createLog('usePlayerState', ['debug']);

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
