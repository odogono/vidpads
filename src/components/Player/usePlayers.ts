'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { getAllMediaMetaData } from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import {
  getPadsWithMedia,
  getSelectedPadSourceUrl,
  getSelectedPadStartAndEndTime,
  useEditActive,
  usePads
} from '@model/store/selectors';
import { Media, Pad } from '@model/types';
import { getObjectDiff, isObjectEqual } from '../../helpers/diff';
import { PlayerProps } from './types';

const log = createLog('player/usePlayers');

type PlayerMap = { [key: string]: PlayerProps };

export const usePlayers = () => {
  const { store, isReady, pads } = usePads();

  const [players, setPlayers] = useState<PlayerMap>({});
  const [visiblePlayerId, setVisiblePlayerId] = useState<string | undefined>();

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
    const selectedPadSourceUrl = getSelectedPadSourceUrl(store);
    const { start } = getSelectedPadStartAndEndTime(store);
    // log.debug('padsWithMedia', padsWithMedia);

    // log.debug('selectedPadSourceUrl', selectedPadSourceUrl);
    (async () => {
      const media = await getAllMediaMetaData();

      // log.debug('media', media.length);
      // log.debug('padsWithMedia', padsWithMedia.length);

      const mediaMap = new Map<string, Media>();
      media.forEach((m) => mediaMap.set(m.url, m));

      // create a player for each media
      const newPlayers = padsWithMedia.reduce((acc, pad) => {
        const mediaUrl = getPadSourceUrl(pad);
        if (!mediaUrl) return acc;
        const media = mediaMap.get(mediaUrl);
        if (!media) return acc;

        const isSelected = selectedPadSourceUrl === mediaUrl;
        const player = acc[mediaUrl];

        acc[mediaUrl] = {
          ...{ ...(player ?? {}) },
          id: mediaUrl,
          isVisible: isSelected,
          // todo - should derive a start time from all the pads
          initialTime: isSelected ? start : -1,
          media
        };
        return acc;
      }, {} as PlayerMap);

      // only use the urls to determine if we need to update the players
      const playerKeys = Object.keys(players);
      const newPlayerKeys = Object.keys(newPlayers);

      // log.debug('playerKeys', playerKeys);
      // log.debug('newPlayerKeys', newPlayerKeys);

      if (!isObjectEqual(playerKeys, newPlayerKeys)) {
        // log.debug('setting players', newPlayers);
        setPlayers(newPlayers);
      }
      // playersRef.current = newPlayers;

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
    })();
  }, [pads, isReady, store, players]);

  return {
    getMediaUrlFromPadId,
    pads,
    players,
    visiblePlayerId,
    setVisiblePlayerId
  };
};
