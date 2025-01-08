import { useCallback, useEffect, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { isImageMetadata, isVideoMetadata } from '@helpers/metadata';
import { ImagePlayer } from './ImagePlayer';
import { LocalPlayer } from './LocalPlayer';
import { PlayerProps } from './types';
import { usePlayers } from './usePlayers';

const log = createLog('player/container');

export const PlayerContainer = () => {
  const events = useEvents();
  const { getMediaFromPadId, players, visiblePlayerId, setVisiblePlayerId } =
    usePlayers();

  const handlePadTouchdown = useCallback(
    ({ padId }: { padId: string }) => {
      log.debug('handlePadTouchdown', padId);

      const mediaUrl = getMediaFromPadId(padId);
      if (!mediaUrl) {
        log.debug('no media url for pad', padId);
        return;
      }

      setVisiblePlayerId(mediaUrl);
      events.emit('video:start', { url: mediaUrl });
    },
    [events, getMediaFromPadId, setVisiblePlayerId]
  );

  const handlePadTouchup = useCallback(
    ({ padId }: { padId: string }) => {
      log.debug('handlePadTouchup', padId);
      // setVisiblePlayerId(null);
      events.emit('video:stop', { url: getMediaFromPadId(padId) });
    },
    [events, getMediaFromPadId]
  );

  useEffect(() => {
    events.on('pad:touchdown', handlePadTouchdown);
    events.on('pad:touchup', handlePadTouchup);

    return () => {
      events.off('pad:touchdown', handlePadTouchdown);
      events.off('pad:touchup', handlePadTouchup);
    };
  }, [events, handlePadTouchdown, handlePadTouchup]);

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
