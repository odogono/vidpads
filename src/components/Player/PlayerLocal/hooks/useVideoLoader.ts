import { useEffect, useRef } from 'react';

import { createLog } from '@helpers/log';
import { loadVideoData as dbLoadVideoData } from '@model/db/api';
import { MediaVideo } from '@model/types';

const log = createLog('player/local/useVideoLoader', ['error']);

export const useVideoLoader = (
  media: MediaVideo,
  videoRef: React.RefObject<HTMLVideoElement | null>
) => {
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return;

    // if we already a player then return
    if (blobUrlRef.current) {
      return;
    }

    (async () => {
      const { url } = media;

      try {
        const { blob } = await dbLoadVideoData(url);

        // Create a blob URL from the video file
        const videoUrl = URL.createObjectURL(blob);
        blobUrlRef.current = videoUrl;

        // Set the video source and play
        if (videoRef?.current) {
          videoRef.current.src = videoUrl;
        }
      } catch (error) {
        log.error('Error loading video:', url, error);
      }
    })();

    log.debug('useVideoLoader', media.url);

    return () => {
      // log.debug('unmounting', media.url);
      // Clean up blob URL when component unmounts
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [media, videoRef]);
};
