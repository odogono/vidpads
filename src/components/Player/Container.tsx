import { useEffect, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { isImageMetadata, isVideoMetadata } from '@helpers/metadata';
import { getAllMediaMetaData, loadVideoData } from '@model/db/api';
import { getMediaIdFromUrl } from '@model/helpers';
import { getPadSourceUrl } from '@model/pad';
import { PlayPadEvent } from '@model/store/types';
import { useStore } from '@model/store/useStore';
import { useRenderingTrace } from '../../hooks/useRenderingTrace';
import { getPadsWithMedia } from '../../model/store/selectors';
import { ImagePlayer } from './ImagePlayer';
import { LocalPlayer } from './LocalPlayer';
import { PlayerProps } from './types';

const log = createLog('player/container');

type PlayerMap = { [key: string]: PlayerProps };

export const PlayerContainer = () => {
  const events = useEvents();
  const { store, isReady } = useStore();

  const [players, setPlayers] = useState<PlayerMap>({});
  const [visiblePlayerId, setVisiblePlayerId] = useState<string | null>(null);

  // a map of padId to media url
  const padToMediaRef = useRef<{ [key: string]: string }>({});

  const handlePadTouchdown = ({ padId }: { padId: string }) => {
    log.debug('handlePadTouchdown', padId);

    const mediaUrl = padToMediaRef.current[padId];
    if (!mediaUrl) {
      log.debug('no media url for pad', padId, padToMediaRef.current);
      return;
    }

    setVisiblePlayerId(mediaUrl);
    events.emit('video:start', { url: mediaUrl });
  };

  const handlePadTouchup = ({ padId }: { padId: string }) => {
    log.debug('handlePadTouchup', padId);
    setVisiblePlayerId(null);
    events.emit('video:stop', { url: padToMediaRef.current[padId] });
  };

  useEffect(() => {
    events.on('pad:touchdown', handlePadTouchdown);
    events.on('pad:touchup', handlePadTouchup);

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

    return () => {
      events.off('pad:touchdown', handlePadTouchdown);
      events.off('pad:touchup', handlePadTouchup);
    };
  }, [events, store, isReady]);

  // if (isReady) log.debug('render', Object.values(players).length);

  // useRenderingTrace('PlayerContainer', {
  //   players,
  //   isReady,
  //   visiblePlayerId,
  //   store,
  //   events
  // });

  return (
    <div className='relative w-[800px] mx-auto'>
      <div className='relative w-[800px] h-[400px] transition-colors overflow-hidden'>
        {Object.values(players).map((player) => (
          <Player
            key={player.media.url}
            {...player}
            isVisible={player.media.url === visiblePlayerId}
          />
        ))}
      </div>
    </div>
  );
};

const Player = (props: PlayerProps) => {
  if (isVideoMetadata(props.media)) {
    return <LocalPlayer {...props} />;
  } else if (isImageMetadata(props.media)) {
    return <ImagePlayer {...props} />;
  }

  return null;
};
