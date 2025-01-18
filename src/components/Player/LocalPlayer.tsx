import { useCallback, useEffect, useRef } from 'react';

import { extractVideoThumbnailFromVideo } from '@helpers/canvas';
import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { loadVideoData as dbLoadVideoData } from '@model/db/api';
import { usePadDetails } from '@model/hooks/usePads';
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
  media
}: LocalPlayerProps) => {
  const events = useEvents();
  const { getPadInterval } = usePadDetails();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readyCallbackRef = useRef<(() => void) | null>(null);
  const startTimeRef = useRef(0);
  const endTimeRef = useRef(Number.MAX_SAFE_INTEGER);
  const isLoopedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const mediaUrl = media.url;

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

  const handlePlaying = useCallback(() => {
    events.emit('player:playing', {
      url: mediaUrl,
      padId: playerPadId,
      time: videoRef.current?.currentTime ?? 0
    });
  }, [events, mediaUrl, playerPadId]);

  const handlePaused = useCallback(() => {
    events.emit('player:stopped', {
      url: mediaUrl,
      padId: playerPadId,
      time: videoRef.current?.currentTime ?? 0
    });
  }, [events, mediaUrl, playerPadId]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime >= endTimeRef.current) {
      if (isLoopedRef.current) {
        // log.debug('[handleTimeUpdate] looping', id, startTimeRef.current);
        video.currentTime = startTimeRef.current;
      } else {
        stopVideo({
          url: mediaUrl,
          padId: playerPadId,
          time: video.currentTime
        });
      }
    }
    // log.debug('[handleTimeUpdate]', id, video.currentTime);
  }, [stopVideo, mediaUrl, playerPadId]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (showControls) {
      video.controls = true;
    }
    readyCallbackRef.current?.();

    log.debug('❤️ player:ready', mediaUrl, playerPadId);

    events.emit('player:ready', {
      url: mediaUrl,
      padId: playerPadId,
      state: PlayerReadyState.HAVE_METADATA
    });
  }, [events, mediaUrl, playerPadId, showControls]);

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
    const video = videoRef.current;
    if (!video) return;

    // set the initial interval
    const interval = getPadInterval(playerPadId) ?? {
      start: 0,
      end: video.duration
    };

    video.currentTime = interval.start;
  }, [getPadInterval, id, playerPadId]);

  // Add loadedmetadata event listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePaused);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    // video.addEventListener('canplay', handleIsReady);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePaused);
    };
  }, [handleLoadedMetadata, handleTimeUpdate, handlePlaying, handlePaused]);

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
