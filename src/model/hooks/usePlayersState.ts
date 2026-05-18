import { createLog } from '@helpers/log';
import { VOKeys } from '@model/constants';
import { PlayerHandler, PlayerMap } from '@model/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applyPlayerUpdate } from './playerStateUpdate';

const log = createLog('usePlayersState', ['debug']);

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
      return player.isReady || player.isError ? acc + 1 : acc;
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
