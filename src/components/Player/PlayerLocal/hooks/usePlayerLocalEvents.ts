import { RefObject, useCallback, useEffect } from 'react';

import {
  PlayerExtractThumbnail,
  PlayerPlay,
  PlayerSeek,
  PlayerStop,
  PlayerUpdate
} from '@components/Player/types';
import { extractVideoThumbnailFromVideo } from '@helpers/canvas';
import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { isPlaying } from '../helpers';

const log = createLog('player/local/hooks/usePlayerLocalEvents', [
  'debug',
  'error'
]);

interface UsePlayerLocalEventsProps {
  mediaUrl: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  playerPadId: string;
  playVideo: (props: PlayerPlay) => void;
  stopVideo: (props: PlayerStop) => void;
  stopAll: () => void;
  seekVideo: (props: PlayerSeek) => void;
  updatePlayer: (props: PlayerUpdate) => void;
  onPlayerDestroyed: () => void;
  endTimeRef: RefObject<number>;
  startTimeRef: RefObject<number>;
}

export const usePlayerLocalEvents = ({
  mediaUrl,
  videoRef,
  playerPadId,
  playVideo,
  stopVideo,
  stopAll,
  seekVideo,
  updatePlayer,
  endTimeRef,
  onPlayerDestroyed
}: UsePlayerLocalEventsProps) => {
  const events = useEvents();
  const extractThumbnail = useCallback(
    ({ time, url, padId, additional, requestId }: PlayerExtractThumbnail) => {
      if (!videoRef.current) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;

      if (isPlaying(videoRef.current)) {
        if (additional && additional.end) {
          endTimeRef.current = additional.end;
        }

        log.debug('[extractThumbnail] video is playing, skipping');
        return;
      }

      log.debug('[extractThumbnail]', { padId, time, requestId });
      extractVideoThumbnailFromVideo({
        video: videoRef.current,
        frameTime: time
      }).then((thumbnail) => {
        if (thumbnail === '') {
          return;
        }

        // log.debug('[extractThumbnail] extracted', { padId, time, requestId });
        events.emit('video:thumbnail-extracted', {
          url,
          padId,
          time,
          thumbnail,
          additional,
          requestId: `LocalPlayer:${requestId}`
        });
      });
    },
    [videoRef, mediaUrl, playerPadId, endTimeRef, events]
  );

  useEffect(() => {
    events.on('video:start', playVideo);
    events.on('video:stop', stopVideo);
    events.on('cmd:cancel', stopAll);
    events.on('video:seek', seekVideo);
    events.on('video:extract-thumbnail', extractThumbnail);
    events.on('player:update', updatePlayer);
    return () => {
      events.off('video:start', playVideo);
      events.off('video:stop', stopVideo);
      events.off('cmd:cancel', stopAll);
      events.off('video:seek', seekVideo);
      events.off('video:extract-thumbnail', extractThumbnail);
      events.off('player:update', updatePlayer);

      onPlayerDestroyed();
    };
  }, [
    onPlayerDestroyed,
    events,
    extractThumbnail,
    playVideo,
    seekVideo,
    stopVideo,
    stopAll,
    updatePlayer
  ]);
};
