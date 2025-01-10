import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';

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
  PlayerReadyStateKeys,
  PlayerRef,
  PlayerSeek,
  PlayerStop
} from './types';

type LocalPlayerProps = PlayerProps;
// type handleVideoStartProps = EventEmitterEvents['video:start'];
// type handleVideoStopProps = EventEmitterEvents['video:stop'];

const log = createLog('player/local');

export const LocalPlayer = forwardRef<PlayerRef, LocalPlayerProps>(
  ({ id, isVisible, showControls, media }, forwardedRef) => {
    const events = useEvents();
    const videoRef = useRef<HTMLVideoElement>(null);
    const readyCallbackRef = useRef<(() => void) | null>(null);
    const startTimeRef = useRef(0);
    const endTimeRef = useRef(Number.MAX_SAFE_INTEGER);
    const isLoopedRef = useRef(false);
    const isPlayingRef = useRef(false);

    useVideoLoader(media as MediaVideo, videoRef);

    const playVideo = useCallback(
      ({ start, end, isLoop, url }: PlayerPlay) => {
        if (!videoRef.current) return;
        if (url !== media.url) return;

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
        videoRef.current.currentTime = startTime;
        isPlayingRef.current = true;
        videoRef.current.play();
        log.debug('[playVideo]', id, { start, end, isLoop, url });
      },
      [videoRef, media.url]
    );

    const stopVideo = useCallback(
      ({ url }: PlayerStop) => {
        if (url !== media.url) return;
        if (!videoRef.current) return;
        videoRef.current.pause();
        isPlayingRef.current = false;
      },
      [videoRef, media.url]
    );

    const seekVideo = useCallback(
      ({ time, url }: PlayerSeek) => {
        // log.debug('[seekVideo]', id, time', { time, url, mediaUrl: media.url });
        if (!videoRef.current) return;
        if (url !== media.url) return;
        videoRef.current.currentTime = time;
      },
      [videoRef, media.url]
    );

    const extractThumbnail = useCallback(
      ({ time, url, additional }: PlayerExtractThumbnail) => {
        if (!videoRef.current) return;
        if (url !== media.url) return;
        videoRef.current.currentTime = time;
        extractVideoThumbnailFromVideo({
          video: videoRef.current,
          frameTime: time
        }).then((thumbnail) => {
          events.emit('video:thumbnail-extracted', {
            url,
            time,
            thumbnail,
            additional
          });
        });
      },
      [media.url, events]
    );

    useImperativeHandle(forwardedRef, () => ({
      setCurrentTime: (time: number) => {
        if (!videoRef.current) return;
        // log.debug('[forwardRef] setCurrentTime', time);
        videoRef.current.currentTime = time;
      },
      play: playVideo,
      stop: stopVideo,

      onReady: (callback: () => void) => {
        readyCallbackRef.current = callback;
        // If video is already loaded, call callback immediately
        if ((videoRef.current?.readyState ?? 0) >= 4) {
          callback();
        }
      },
      getThumbnail: async (frameTime: number) => {
        if (!videoRef.current) return;
        return extractVideoThumbnailFromVideo({
          video: videoRef.current,
          frameTime
        });
      }
    }));

    const handleTimeUpdate = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      if (video.currentTime >= endTimeRef.current) {
        if (isLoopedRef.current) {
          video.currentTime = startTimeRef.current;
        } else {
          stopVideo({ url: media.url });
        }
      }
    }, [stopVideo, media.url]);

    const handleIsReady = useCallback(() => {
      events.emit('video:ready', {
        url: media.url,
        duration: videoRef.current?.duration ?? 0,
        readyState: PlayerReadyStateKeys[
          videoRef.current?.readyState ?? 0
        ] as PlayerReadyState,
        dimensions: {
          width: videoRef.current?.videoWidth ?? 0,
          height: videoRef.current?.videoHeight ?? 0
        }
      });
      log.debug('[handleIsReady]', id, {
        url: media.url,
        duration: videoRef.current?.duration ?? 0,
        readyState: PlayerReadyStateKeys[
          videoRef.current?.readyState ?? 0
        ] as PlayerReadyState,
        dimensions: {
          width: videoRef.current?.videoWidth ?? 0,
          height: videoRef.current?.videoHeight ?? 0
        }
      });
    }, [events, media.url]);

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

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      // const isPlaying =
      //   video.currentTime > 0 &&
      //   !video.paused &&
      //   !video.ended &&
      //   video.readyState > video.HAVE_CURRENT_DATA;
    }, [isVisible, videoRef]);

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
    }, []);

    // log.debug('rendering', media.url, isVisible, currentTimeProp);

    return <video ref={videoRef} className='w-full h-full' />;
  }
);

LocalPlayer.displayName = 'LocalPlayer';

const useVideoLoader = (
  media: MediaVideo,
  videoRef: React.RefObject<HTMLVideoElement>
) => {
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // if (!isVidpadUrl(url)) return;

    const video = videoRef.current;
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
        if (videoRef.current) {
          // log.debug(url, 'setting video src', videoRef.current, videoUrl);
          videoRef.current.src = videoUrl;
          // videoRef.current.currentTime = currentTime;
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
