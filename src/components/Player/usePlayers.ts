import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { getAllMediaMetaData } from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import {
  getPadsWithMedia,
  useEditActive,
  usePads
} from '@model/store/selectors';
import { Pad } from '@model/types';
import { PlayerProps } from './types';

const log = createLog('player/usePlayers');

type PlayerMap = { [key: string]: PlayerProps };

export const usePlayers = () => {
  const { store, isReady, pads } = usePads();
  const { isEditActive } = useEditActive();

  const [players, setPlayers] = useState<PlayerMap>({});
  const [visiblePlayerId, setVisiblePlayerId] = useState<string | null>(null);

  // a map of padId to media url
  const padToMediaRef = useRef<{ [key: string]: Pad }>({});

  const getMediaUrlFromPadId = useCallback((padId: string) => {
    const pad = padToMediaRef.current[padId];
    if (!pad) return null;
    return getPadSourceUrl(pad);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // retrieve all the pads with media
    const padsWithMedia = getPadsWithMedia(store);
    // log.debug('padsWithMedia', padsWithMedia);

    (async () => {
      const media = await getAllMediaMetaData();

      // create a player for each media
      const newPlayers = media.reduce((acc, media) => {
        // const pad = padsWithMedia.find((pad) => pad.pipeline.source?.url === media.url);
        // if (!pad) return acc;

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
          // const url = getPadSourceUrl(pad);
          // if (!url) return acc;
          acc[pad.id] = pad;
          return acc;
        },
        {} as { [key: string]: Pad }
      );

      padToMediaRef.current = newPadToMedia;

      // log.debug('padToMedia', newPadToMedia);
    })();
  }, [pads, isReady, isEditActive]);

  return {
    getMediaUrlFromPadId,
    pads,
    players,
    visiblePlayerId,
    setVisiblePlayerId
  };
};
