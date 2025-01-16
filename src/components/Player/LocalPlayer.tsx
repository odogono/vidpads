import { useCallback, useEffect, useRef } from 'react';

import { extractVideoThumbnailFromVideo } from '@helpers/canvas';
import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { loadVideoData as dbLoadVideoData } from '@model/db/api';
import { MediaVideo } from '@model/types';
import {
  PlayerExtractThumbnail,
  PlayerPlay,
  PlayerProps,
  PlayerReadyState,
  PlayerSeek,
  PlayerStop
} from './types';

type LocalPlayerProps = PlayerProps;

const log = createLog('player/local');

export const LocalPlayer = ({
  id,
  padId: playerPadId,
  showControls,
  media,
  mediaUrl,
  interval
}: LocalPlayerProps) => {
  const events = useEvents();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readyCallbackRef = useRef<(() => void) | null>(null);
  const startTimeRef = useRef(0);
  const endTimeRef = useRef(Number.MAX_SAFE_INTEGER);
  const isLoopedRef = useRef(false);
  const isPlayingRef = useRef(false);

  useVideoLoader(media as MediaVideo, videoRef);

  const playVideo = useCallback(
    ({ start, end, isLoop, url, padId }: PlayerPlay) => {
      if (!videoRef.current) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;

      if (isPlayingRef.current && isLoopedRef.current) {
        videoRef.current.pause();
        isPlayingRef.current = false;
        return;
      }

      const startTime = (start ?? 0) === -1 ? 0 : (start ?? 0);
      const endTime =
        (end ?? Number.MAX_SAFE_INTEGER) === -1
          ? Number.MAX_SAFE_INTEGER
          : (end ?? Number.MAX_SAFE_INTEGER);

      startTimeRef.current = startTime;
      endTimeRef.current = endTime;
      isLoopedRef.current = isLoop ?? false;
      // log.debug('[playVideo]', id, startTime);
      videoRef.current.currentTime = startTime;
      isPlayingRef.current = true;
      videoRef.current.play();
      // log.debug('[playVideo]', id, { start, end, isLoop, url });
    },
    [mediaUrl, playerPadId]
  );

  const stopVideo = useCallback(
    ({ url, padId }: PlayerStop) => {
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;
      if (!videoRef.current) return;
      videoRef.current.pause();
      isPlayingRef.current = false;
    },
    [videoRef, mediaUrl, playerPadId]
  );

  const seekVideo = useCallback(
    ({ time, url, padId }: PlayerSeek) => {
      // log.debug('[seekVideo]', id, time, { time, url, mediaUrl: mediaUrl });
      if (!videoRef.current) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;
      videoRef.current.currentTime = time;
    },
    [mediaUrl, playerPadId]
  );

  const extractThumbnail = useCallback(
    ({ time, url, padId, additional }: PlayerExtractThumbnail) => {
      if (!videoRef.current) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;

      // log.debug('[extractThumbnail]', id, time);
      extractVideoThumbnailFromVideo({
        video: videoRef.current,
        frameTime: time
      }).then((thumbnail) => {
        events.emit('video:thumbnail-extracted', {
          url,
          padId,
          time,
          thumbnail,
          additional
        });
      });
    },
    [mediaUrl, playerPadId, events]
  );

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime >= endTimeRef.current) {
      if (isLoopedRef.current) {
        // log.debug('[handleTimeUpdate] looping', id, startTimeRef.current);
        video.currentTime = startTimeRef.current;
      } else {
        stopVideo({ url: mediaUrl, padId: playerPadId });
      }
    }
    // log.debug('[handleTimeUpdate]', id, video.currentTime);
  }, [stopVideo, mediaUrl, playerPadId]);

  const handleIsReady = useCallback(() => {
    events.emit('player:ready', {
      url: mediaUrl,
      padId: playerPadId,
      state: PlayerReadyState.HAVE_METADATA
    });

    // events.emit('video:ready', {
    //   url: mediaUrl,
    //   duration: videoRef.current?.duration ?? 0,
    //   readyState: PlayerReadyStateKeys[
    //     videoRef.current?.readyState ?? 0
    //   ] as PlayerReadyState,
    //   dimensions: {
    //     width: videoRef.current?.videoWidth ?? 0,
    //     height: videoRef.current?.videoHeight ?? 0
    //   }
    // });
  }, [events, mediaUrl, playerPadId]);

  useEffect(() => {
    events.on('video:start', playVideo);
    events.on('video:stop', stopVideo);
    events.on('video:seek', seekVideo);
    events.on('video:extract-thumbnail', extractThumbnail);
    return () => {
      events.off('video:start', playVideo);
      events.off('video:stop', stopVideo);
      events.off('video:seek', seekVideo);
      events.off('video:extract-thumbnail', extractThumbnail);
    };
  }, [events, extractThumbnail, playVideo, seekVideo, stopVideo]);

  // runs on mount to set the initial value
  useEffect(() => {
    if (!videoRef.current) return;
    if (!interval || interval.start === -1) return;
    // log.debug('useEffect setting initialTime', id, initialTime);
    videoRef.current.currentTime = interval.start;
  }, [id, interval]);

  // Add loadedmetadata event listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (showControls) {
        video.controls = true;
      }
      readyCallbackRef.current?.();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplay', handleIsReady);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('canplay', handleIsReady);
    };
  }, [handleIsReady, handleTimeUpdate, showControls]);

  // if (isVisible) {
  //   log.debug('rendering', media.url, isVisible, initialTime);
  // }

  return <video ref={videoRef} className='w-full h-full' />;
};

LocalPlayer.displayName = 'LocalPlayer';

const useVideoLoader = (
  media: MediaVideo,
  videoRef: React.RefObject<HTMLVideoElement | null>
) => {
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // if (!isVidpadUrl(url)) return;

    const video = videoRef?.current;
    if (!video) return;

    // if we already a player then return
    if (blobUrlRef.current) {
      return;
    }

    // log.debug('mounting', media.url, isVisible, currentTime);

    (async () => {
      const { id } = media;

      try {
        const { blob } = await dbLoadVideoData(id);

        // Create a blob URL from the video file
        const videoUrl = URL.createObjectURL(blob);
        blobUrlRef.current = videoUrl;

        // Set the video source and play
        if (videoRef?.current) {
          videoRef.current.src = videoUrl;
        }
      } catch (error) {
        log.error(id, 'Error loading video:', error);
      }
    })();

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
