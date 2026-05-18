import { isObjectEqual } from '@helpers/diff';
import { createLog } from '@helpers/log';
import { updateMetadataProperty as dbUpdateMetadataProperty } from '@model/db/api';
import { PlayerHandler } from '@model/types';

const log = createLog('playerStateUpdate', ['debug']);

export const applyPlayerUpdate = async (
  player: PlayerHandler | undefined,
  updatedPlayer: Partial<PlayerHandler>
): Promise<PlayerHandler> => {
  if (!player) throw new Error('Player not found');
  const { mediaUrl, padId } = { ...player, ...updatedPlayer };

  if (!mediaUrl)
    log.debug('[mutatePlayer]', 'no mediaUrl', { ...player, ...updatedPlayer });
  if (!padId)
    log.debug('[mutatePlayer]', 'no padId', { ...player, ...updatedPlayer });

  if (mediaUrl) {
    const writes: Promise<void>[] = [];

    if (
      player.duration === -1 &&
      updatedPlayer.duration !== undefined &&
      updatedPlayer.duration !== -1
    ) {
      log.debug('[mutatePlayer]', 'updated duration', updatedPlayer.duration);
      writes.push(
        dbUpdateMetadataProperty(mediaUrl, 'duration', updatedPlayer.duration)
      );
    }
    if (
      updatedPlayer.playbackRates !== undefined &&
      player.playbackRates !== undefined &&
      !isObjectEqual(player.playbackRates, updatedPlayer.playbackRates)
    ) {
      log.debug(
        '[mutatePlayer]',
        'updated playbackRates',
        updatedPlayer.playbackRates
      );
      writes.push(
        dbUpdateMetadataProperty(
          mediaUrl,
          'playbackRates',
          updatedPlayer.playbackRates
        )
      );
    }

    await Promise.all(writes);
  }

  return {
    ...player,
    ...updatedPlayer
  } as PlayerHandler;
};
