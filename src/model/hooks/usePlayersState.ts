import { isObjectEqual } from '@helpers/diff';
import { createLog } from '@helpers/log';
import { VOKeys } from '@model/constants';
import { updateMetadataProperty as dbUpdateMetadataProperty } from '@model/db/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface PlayerHandler {
  padId: string;
  mediaUrl: string;
  isReady: boolean;
  duration: number;
  playbackRates: number[];
}

type PlayerMap = Map<string, PlayerHandler>;

const log = createLog('usePlayersState');

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
      log.debug('[mutatePlayer]', 'update>', updatedPlayer);
      const { padId } = updatedPlayer;
      log.debug('[mutatePlayer]', 'padId', padId);
      if (!padId) throw new Error('PadId is required');

      const player = players.get(padId) ?? (updatedPlayer as PlayerHandler);
      log.debug('[mutatePlayer]', 'player', { padId }, player);
      // if (!player) {
      //   log.debug('[mutatePlayer]', '😂 player not found', { padId }, players);
      // }
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

      // invalidate the metadata since duration and/or playbackRates may have changed
      queryClient.invalidateQueries({
        queryKey: VOKeys.metadata(player.mediaUrl)
      });
    }
  });
  // get a count of how many players are not yet ready
  const playerReadyCount = Array.from(players.values()).reduce(
    (acc: number, player: PlayerHandler) => {
      return player.isReady ? acc + 1 : acc;
    },
    0
  );

  const isLoading = playerReadyCount < players.size;

  return {
    updatePlayer,
    players,
    isLoading,
    playerReadyCount
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
