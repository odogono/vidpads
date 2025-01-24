'use client';

import { useMemo, useRef } from 'react';

import { createLog } from '@helpers/log';
import { usePadsExtended } from '@model/hooks/usePads';
import { getPadSourceUrl } from '@model/pad';
import { useQueryClient } from '@tanstack/react-query';
import { VOKeys } from '../../model/constants';
import { PlayerProps } from './types';

const log = createLog('player/usePlayers');

type PlayersResult = [string, PlayerProps[]];

export const usePlayers = () => {
  const { isReady, pads, padsWithMedia, urlToMetadata } = usePadsExtended();
  const queryClient = useQueryClient();

  const playersRef = useRef<PlayerProps[]>([]);
  const padUrlStrRef = useRef<string>('');

  useMemo<PlayersResult>(() => {
    // log.debug('[usePlayers] padsWithMedia:', padsWithMedia.length);
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
          { url },
          queryClient.getQueryData(VOKeys.metadata(url))
        );
        log.debug('[usePlayers] urlToMetadata', urlToMetadata);
        return acc;
      }

      const id = `player-${pad.id}`;

      const props: PlayerProps = {
        id,
        padId: pad.id,
        isVisible: false,
        media
      };

      // the key has to be for each active pad!
      acc.push(props);

      return acc;
    }, [] as PlayerProps[]);

    const padUrlStr = result
      .map((player) => `${player.padId}: ${player.media.url}`)
      .join(', ');

    if (padUrlStr !== padUrlStrRef.current) {
      // padsRef.current = padsWithMedia;
      playersRef.current = result;
      padUrlStrRef.current = padUrlStr;
    }

    return [padUrlStr, result];
  }, [padsWithMedia, isReady, urlToMetadata, queryClient]);

  return {
    pads,
    padUrlStr: padUrlStrRef.current,
    players: playersRef.current
  };
};
