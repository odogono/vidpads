'use client';

import { useMemo, useState } from 'react';

// import { createLog } from '@helpers/log';
import { usePadsExtended } from '@model/hooks/usePads';
import { getPadSourceUrl, getPadStartAndEndTime } from '@model/pad';
import { PlayerProps } from './types';

// const log = createLog('player/usePlayers');

type PlayersResult = PlayerProps[];

export const usePlayers = () => {
  const { isReady, pads, padsWithMedia, urlToMetadata } = usePadsExtended();

  const [visiblePlayerId, setVisiblePlayerId] = useState<string | undefined>();

  const players: PlayersResult = useMemo<PlayersResult>(() => {
    const result = padsWithMedia.reduce((acc, pad) => {
      const url = getPadSourceUrl(pad);
      if (!isReady || !url) return acc;

      const media = urlToMetadata?.get(url);
      if (!media) return acc;

      let interval = getPadStartAndEndTime(pad);
      if (!interval) {
        const media = urlToMetadata?.get(url);
        if (!media) return acc;
        const { duration } = media;
        interval = { start: 0, end: duration };
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
    }, [] as PlayersResult);

    return result;
  }, [padsWithMedia, urlToMetadata, isReady]);

  return {
    pads,
    players,
    visiblePlayerId,
    setVisiblePlayerId
  };
};
