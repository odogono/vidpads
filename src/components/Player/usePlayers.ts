import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { getAllMediaMetaData } from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import { getPadsWithMedia, usePads } from '@model/store/selectors';
import { PlayerProps } from './types';

const log = createLog('player/usePlayers');

type PlayerMap = { [key: string]: PlayerProps };

export const usePlayers = () => {
  const { store, isReady, pads } = usePads();

  const [players, setPlayers] = useState<PlayerMap>({});
  const [visiblePlayerId, setVisiblePlayerId] = useState<string | null>(null);

  // a map of padId to media url
  const padToMediaRef = useRef<{ [key: string]: string }>({});

  const getMediaFromPadId = useCallback((padId: string) => {
    return padToMediaRef.current[padId];
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // retrieve all the pads with media
    const padsWithMedia = getPadsWithMedia(store);
    log.debug('padsWithMedia', padsWithMedia);

    (async () => {
      const media = await getAllMediaMetaData();

      // create a player for each media
      const newPlayers = media.reduce((acc, media) => {
        acc[media.url] = {
          isVisible: false,
          currentTime: 0,
          media
        };
        return acc;
      }, {} as PlayerMap);

      setPlayers(newPlayers);
      // log.debug('newPlayers', Object.values(newPlayers));

      const newPadToMedia = padsWithMedia.reduce(
        (acc, pad) => {
          const url = getPadSourceUrl(pad);
          if (!url) return acc;
          acc[pad.id] = url;
          return acc;
        },
        {} as { [key: string]: string }
      );

      padToMediaRef.current = newPadToMedia;

      // log.debug('padToMedia', newPadToMedia);
    })();
  }, [pads, isReady]);

  return { getMediaFromPadId, players, visiblePlayerId, setVisiblePlayerId };
};
