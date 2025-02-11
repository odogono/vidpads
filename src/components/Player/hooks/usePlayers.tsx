'use client';

import { useMemo, useRef } from 'react';

import { createLog } from '@helpers/log';
import {
  isImageMetadata,
  isVideoMetadata,
  isYouTubeMetadata
} from '@helpers/metadata';
import { VOKeys } from '@model/constants';
import { usePadsExtended } from '@model/hooks/usePads';
import {
  getPadChokeGroup,
  getPadPlayPriority,
  getPadPlaybackResume,
  getPadSourceUrl
} from '@model/pad';
import { Media } from '@model/types';
import { useQueryClient } from '@tanstack/react-query';
import { PlayerProps } from '../types';

const log = createLog('player/usePlayers', ['debug']);

type PlayersResult = [string, PlayerProps[]];

export const usePlayers = () => {
  const {
    pads,
    padsWithMedia,
    padsWithMediaStr,
    urlToMetadata,
    urlToMetadataStr
  } = usePadsExtended();
  const queryClient = useQueryClient();

  const playersRef = useRef<PlayerProps[]>([]);
  const padUrlStrRef = useRef<string>('');

  useMemo<PlayersResult>(() => {
    log.debug('padsWithMedia:', padsWithMediaStr);

    // there is always a player for displaying the
    // title/loading status
    const initial: PlayerProps[] = [
      // {
      //   id: 'player-title',
      //   padId: 'title',
      //   isVisible: false,
      //   media: {} as Media,
      //   type: 'title'
      // }
    ];

    const result = padsWithMedia.reduce((acc, pad) => {
      const url = getPadSourceUrl(pad);
      if (!url) {
        if (!url) log.debug('no url:', pad.id, url);
        return acc;
      }

      const media = urlToMetadata?.get(url);
      if (!media) {
        log.debug(
          'no media:',
          pad.id,
          { url },
          queryClient.getQueryData(VOKeys.metadata(url))
        );
        log.debug('urlToMetadata', urlToMetadata);
        return acc;
      }

      const id = `player-${pad.id}`;

      const props: PlayerProps = {
        id,
        padId: pad.id,
        isVisible: false,
        media,
        type: getPlayerType(media),
        chokeGroup: getPadChokeGroup(pad),
        playPriority: getPadPlayPriority(pad),
        isResuming: getPadPlaybackResume(pad)
      };

      // the key has to be for each active pad!
      acc.push(props);

      return acc;
    }, initial);

    const padUrlStr = result
      .map((player) => `${player.padId}: ${player.media.url}`)
      .join(', ');

    if (padUrlStr !== padUrlStrRef.current) {
      // padsRef.current = padsWithMedia;
      playersRef.current = result;
      padUrlStrRef.current = padUrlStr;
    }

    return [padUrlStr, result];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [padsWithMediaStr, urlToMetadataStr, queryClient]);

  return {
    pads,
    padUrlStr: padUrlStrRef.current,
    players: playersRef.current
  };
};

const getPlayerType = (media: Media): PlayerProps['type'] => {
  if (isYouTubeMetadata(media)) return 'youtube';
  if (isVideoMetadata(media)) return 'video';
  if (isImageMetadata(media)) return 'image';
  return 'title';
};
