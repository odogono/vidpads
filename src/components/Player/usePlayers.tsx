'use client';

import { JSX, useMemo, useState } from 'react';

import { createLog } from '@helpers/log';
import { usePadsExtended } from '@model/hooks/usePads';
import { getPadSourceUrl, getPadStartAndEndTime } from '@model/pad';
import { Player } from './Player';
import { PlayerProps } from './types';

const log = createLog('player/usePlayers');

export const usePlayers = () => {
  const { isReady, pads, padsWithMedia, urlToMetadata } = usePadsExtended();

  const [visiblePlayerId, setVisiblePlayerId] = useState<string | undefined>();

  const players = useMemo<JSX.Element[]>(() => {
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
        isVisible: true,
        media,
        mediaUrl: media.url,
        interval
      };

      log.debug('player', props);

      // the key has to be for each active pad!
      acc.push(<Player key={id} {...props} />);

      return acc;
    }, [] as JSX.Element[]);

    // const result = padSourceUrls
    //   .map((url) => {
    //     const media = urlToMetadata?.get(url);
    //     if (!isReady || !media) return null;

    //     const intervals = mediaIntervals[url];

    //     const props: PlayerProps = {
    //       id: url,
    //       isVisible: true,
    //       media,
    //       intervals
    //     };

    //     log.debug('player', props);

    //     return <Player key={url} {...props} />;
    //   })
    //   .filter(Boolean) as unknown as Player[];

    return result;
  }, [padsWithMedia, urlToMetadata, isReady]);

  return {
    pads,
    players,
    visiblePlayerId,
    setVisiblePlayerId
  };
};
