'use client';

import { useMemo, useState } from 'react';

import { getObjectDiff, isObjectEqual } from '@helpers/diff';
import { createLog } from '@helpers/log';
import { usePadsExtended } from '@model/hooks/usePads';
import { Player } from './Player';
import { PlayerProps } from './types';

const log = createLog('player/usePlayers');

export const usePlayers = () => {
  const { isReady, pads, padSourceUrls, urlToMetadata, mediaIntervals } =
    usePadsExtended();

  const [visiblePlayerId, setVisiblePlayerId] = useState<string | undefined>();

  const players = useMemo<Player[]>(() => {
    const result = padSourceUrls
      .map((url) => {
        const media = urlToMetadata?.get(url);
        if (!isReady || !media) return null;

        const intervals = mediaIntervals[url];

        const props: PlayerProps = {
          id: url,
          isVisible: true,
          media,
          intervals
        };

        log.debug('player', props);

        return <Player key={url} {...props} />;
      })
      .filter(Boolean) as unknown as Player[];

    return result;
  }, [padSourceUrls, urlToMetadata, isReady, mediaIntervals]);

  // useEffect(() => {
  //   if (!isReady) return;

  //   const { start } = selectedPadStartAndEndTime ?? { start: -1, end: -1 };
  //   // log.debug('padsWithMedia', padsWithMedia);

  //   // log.debug('selectedPadSourceUrl', selectedPadSourceUrl);
  //   (async () => {
  //     // const media = await getAllMediaMetaData();

  //     log.debug('metadata', metadata?.length);
  //     // log.debug('padsWithMedia', padsWithMedia.length);

  //     const mediaMap = new Map<string, Media>();
  //     metadata?.forEach((m) => mediaMap.set(m.url, m));

  //     // create a player for each media
  //     const newPlayers = padsWithMedia.reduce((acc, pad) => {
  //       const mediaUrl = getPadSourceUrl(pad);
  //       if (!mediaUrl) return acc;
  //       const media = mediaMap.get(mediaUrl);
  //       if (!media) return acc;

  //       const isSelected = selectedPadSourceUrl === mediaUrl;
  //       const player = acc[mediaUrl];

  //       acc[mediaUrl] = {
  //         ...{ ...(player ?? {}) },
  //         id: mediaUrl,
  //         isVisible: isSelected,
  //         // todo - should derive a start time from all the pads
  //         initialTime: isSelected ? start : -1,
  //         media
  //       };
  //       return acc;
  //     }, {} as PlayerMap);

  //     // only use the urls to determine if we need to update the players
  //     const playerKeys = Object.keys(players);
  //     const newPlayerKeys = Object.keys(newPlayers);

  //     // log.debug('playerKeys', playerKeys);
  //     // log.debug('newPlayerKeys', newPlayerKeys);

  //     if (!isObjectEqual(playerKeys, newPlayerKeys)) {
  //       // log.debug('setting players', newPlayers);
  //       setPlayers(newPlayers);
  //     }
  //     // playersRef.current = newPlayers;

  //     const newPadToMedia = padsWithMedia.reduce(
  //       (acc, pad) => {
  //         // const url = getPadSourceUrl(pad);
  //         // if (!url) return acc;
  //         acc[pad.id] = pad;
  //         return acc;
  //       },
  //       {} as { [key: string]: Pad }
  //     );

  //     padToMediaRef.current = newPadToMedia;
  //   })();
  // }, [
  //   padsWithMedia,
  //   isReady,
  //   store,
  //   players,
  //   metadata,
  //   selectedPadStartAndEndTime,
  //   selectedPadSourceUrl
  // ]);

  return {
    pads,
    players,
    visiblePlayerId,
    setVisiblePlayerId
  };
};
