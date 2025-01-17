'use client';

import { useMemo } from 'react';

import { createLog } from '@helpers/log';
import { usePadsExtended } from '@model/hooks/usePads';
import { getPadSourceUrl, getPadStartAndEndTime } from '@model/pad';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY_METADATA } from '../../model/constants';
import { PlayerProps } from './types';

const log = createLog('player/usePlayers');

type PlayersResult = [string, PlayerProps[]];

export const usePlayers = () => {
  const { isReady, pads, padsWithMedia, urlToMetadata } = usePadsExtended();
  const queryClient = useQueryClient();

  const [padUrlStr, players] = useMemo<PlayersResult>(() => {
    log.debug('[usePlayers] padsWithMedia:', padsWithMedia.length);
    const result = padsWithMedia.reduce((acc, pad) => {
      const url = getPadSourceUrl(pad);
      if (!isReady || !url) {
        if (!isReady) log.debug('[usePlayers] isReady:', pad.id, isReady);
        if (!url) log.debug('[usePlayers] no url:', pad.id, url);
        return acc;
      }

      const media = urlToMetadata?.get(url);
      if (!media) {
        log.debug(
          '[usePlayers] no media:',
          pad.id,
          media,
          queryClient.getQueryData([QUERY_KEY_METADATA, url])
        );
        return acc;
      }

      let interval = getPadStartAndEndTime(pad);
      if (!interval) {
        interval = { start: 0, end: media.duration };
      }

      const id = `player-${pad.id}`;

      const props: PlayerProps = {
        id,
        padId: pad.id,
        isVisible: false,
        media,
        mediaUrl: media.url,
        interval
      };

      // the key has to be for each active pad!
      acc.push(props);

      return acc;
    }, [] as PlayerProps[]);

    const padUrlStr = result
      .map((player) => `${player.padId}: ${player.mediaUrl}`)
      .join(', ');

    return [padUrlStr, result];
  }, [padsWithMedia, urlToMetadata, isReady]);

  return {
    pads,
    padUrlStr,
    players
  };
};
