import { useCallback, useEffect, useRef } from 'react';

import { extractVideoThumbnailFromVideo } from '@helpers/canvas';
import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { loadVideoData as dbLoadVideoData } from '@model/db/api';
import { usePadDetails } from '@model/hooks/usePads';
import { usePlayerState } from '@model/hooks/usePlayerState';
import { MediaVideo } from '@model/types';
import {
  PlayerExtractThumbnail,
  PlayerPlay,
  PlayerPlaying,
  PlayerProps,
  PlayerReadyState,
  PlayerSeek,
  PlayerSetPlaybackRate,
  PlayerSetVolume,
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
  const mediaUrl = media.url;
  const { getPadInterval } = usePadDetails(playerPadId);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readyCallbackRef = useRef<(() => void) | null>(null);
  const startTimeRef = useRef(0);
  const endTimeRef = useRef(Number.MAX_SAFE_INTEGER);
  const isLoopedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const playEventRef = useRef<PlayerPlay | undefined>(undefined);
  const {
    onPlayerUpdate: cOnPlayerUpdate,
    onPlayerDestroyed: cOnPlayerDestroyed
  } = usePlayerState(playerPadId, mediaUrl);

  useVideoLoader(media as MediaVideo, videoRef);

  const updateTimeTracking = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const time = video.currentTime;
    const duration = video.duration;
    // log.debug('updateTimeTracking', time, duration);
    if (time !== undefined && duration !== undefined) {
      events.emit('player:time-update', {
        url: mediaUrl,
        padId: playerPadId,
        time,
        duration
      });
    }

    if (animationRef.current !== null) {
      animationRef.current = requestAnimationFrame(updateTimeTracking);
    }
  }, [mediaUrl, playerPadId, events]);

  const startTimeTracking = useCallback(() => {
    if (animationRef.current !== null) {
      return;
    }
    animationRef.current = requestAnimationFrame(updateTimeTracking);
  }, [updateTimeTracking]);

  const stopTimeTracking = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const playVideo = useCallback(
    async (props: PlayerPlay) => {
      const { start, end, isLoop, url, padId, volume, playbackRate, isResume } =
        props;

      if (!videoRef.current) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;

      // save the event so we can emit it later
      playEventRef.current = { ...props };

      const video = videoRef.current;

      if (isPlayingRef.current && isLoopedRef.current) {
        stopTimeTracking();
        video.pause();
        isPlayingRef.current = false;
        return;
      }

      const currentTime = video.currentTime;
      const startTime = (start ?? 0) === -1 ? 0 : (start ?? 0);
      const endTime =
        (end ?? Number.MAX_SAFE_INTEGER) === -1
          ? Number.MAX_SAFE_INTEGER
          : (end ?? Number.MAX_SAFE_INTEGER);

      log.debug('playVideo', {
        currentTime,
        startTime,
        endTime,
        isLoop,
        url,
        padId,
        volume,
        playbackRate,
        isResume
      });

      startTimeRef.current = startTime;
      endTimeRef.current = endTime;
      isLoopedRef.current = isLoop ?? false;

      video.playbackRate = playbackRate ?? 1;
      video.volume = volume ?? 1;

      if (isResume) {
        if (currentTime < startTime || currentTime > endTime) {
          video.currentTime = startTime;
        }
      } else {
        video.currentTime = startTime;
      }

      log.debug('playVideo', 'waiting for sufficient buffer', video.readyState);
      // Wait for sufficient buffer
      await new Promise((resolve) => {
        if (video.readyState >= 3) {
          resolve(void 0);
        } else {
          video.addEventListener('canplay', resolve, {
            once: true
          });
        }
      });

      isPlayingRef.current = true;
      video.play();
      startTimeTracking();
    },
    [mediaUrl, playerPadId, startTimeTracking, stopTimeTracking]
  );

  const stopVideo = useCallback(
    ({ url, padId }: PlayerStop) => {
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;
      if (!videoRef.current) return;
      stopTimeTracking();
      videoRef.current.pause();
      isPlayingRef.current = false;
    },
    [videoRef, mediaUrl, playerPadId, stopTimeTracking]
  );

  const stopAll = useCallback(() => {
    if (!videoRef.current) return;
    stopTimeTracking();
    videoRef.current.pause();
    isPlayingRef.current = false;
  }, [videoRef, stopTimeTracking]);

  const seekVideo = useCallback(
    ({ time, url, padId }: PlayerSeek) => {
      if (!videoRef.current) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;
      log.debug('[seekVideo]', id, time, { time, url, mediaUrl: mediaUrl });
      videoRef.current.currentTime = time;

      const duration = videoRef.current.duration;

      events.emit('player:time-update', {
        url: mediaUrl,
        padId: playerPadId,
        time,
        duration
      });
    },
    [mediaUrl, playerPadId, id, events]
  );

  const setVolume = useCallback(
    ({ url, padId, volume }: PlayerSetVolume) => {
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;
      if (!videoRef.current) return;

      videoRef.current.volume = volume;
    },
    [mediaUrl, playerPadId]
  );

  const setPlaybackRate = useCallback(
    ({ url, padId, rate }: PlayerSetPlaybackRate) => {
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;
      if (!videoRef.current) return;
      videoRef.current.playbackRate = rate;
    },
    [mediaUrl, playerPadId]
  );

  const extractThumbnail = useCallback(
    ({ time, url, padId, additional, requestId }: PlayerExtractThumbnail) => {
      if (!videoRef.current) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;

      // log.debug('[extractThumbnail]', { padId, time, requestId });
      extractVideoThumbnailFromVideo({
        video: videoRef.current,
        frameTime: time
      }).then((thumbnail) => {
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
    [mediaUrl, playerPadId, events]
  );

  const handlePlaying = useCallback(() => {
    const event = {
      ...playEventRef.current,
      time: videoRef.current?.currentTime ?? 0
    } as PlayerPlaying;
    events.emit('player:playing', event);
    log.debug('❤️ player:playing', event);
  }, [events]);

  const handlePaused = useCallback(() => {
    // log.debug('handlePaused', playerPadId);
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
  }, [mediaUrl, playerPadId, stopVideo]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    if (showControls) {
      video.controls = true;
    }
    readyCallbackRef.current?.();

    log.debug('❤️ player:ready', mediaUrl, playerPadId);

    cOnPlayerUpdate({
      padId: playerPadId,
      mediaUrl: mediaUrl,
      isReady: true,
      duration: video.duration,
      playbackRates: [0.25, 0.5, 1, 1.5, 2]
    });

    events.emit('player:ready', {
      url: mediaUrl,
      padId: playerPadId,
      state: PlayerReadyState.HAVE_METADATA
    });
  }, [events, mediaUrl, playerPadId, showControls, cOnPlayerUpdate]);

  useEffect(() => {
    events.on('video:start', playVideo);
    events.on('video:stop', stopVideo);
    events.on('player:stop-all', stopAll);
    events.on('video:seek', seekVideo);
    events.on('video:extract-thumbnail', extractThumbnail);
    events.on('player:set-volume', setVolume);
    events.on('player:set-playback-rate', setPlaybackRate);
    return () => {
      events.off('video:start', playVideo);
      events.off('video:stop', stopVideo);
      events.off('player:stop-all', stopAll);
      events.off('video:seek', seekVideo);
      events.off('video:extract-thumbnail', extractThumbnail);
      events.off('player:set-volume', setVolume);
      events.off('player:set-playback-rate', setPlaybackRate);

      cOnPlayerDestroyed();
    };
  }, [
    cOnPlayerDestroyed,
    events,
    extractThumbnail,
    playVideo,
    seekVideo,
    stopVideo,
    stopAll,
    setPlaybackRate,
    setVolume
  ]);

  // runs on mount to set the initial value
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // set the initial interval
    const interval = getPadInterval() ?? {
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
