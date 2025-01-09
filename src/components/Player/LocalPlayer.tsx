import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';

import { EventEmitterEvents, useEvents } from '@helpers/events';
// import { Pause, Play, RotateCcw } from 'lucide-react';

import { createLog } from '@helpers/log';
import { loadVideoData } from '@model/db/api';
import { MediaVideo } from '@model/types';
import { PlayerProps, PlayerRef } from './types';

type LocalPlayerProps = PlayerProps;
type handleVideoStartProps = EventEmitterEvents['video:start'];
// type handleVideoStopProps = EventEmitterEvents['video:stop'];

const log = createLog('player/local');

export const LocalPlayer = forwardRef<PlayerRef, LocalPlayerProps>(
  ({ isVisible, showControls, media }, forwardedRef) => {
    const events = useEvents();
    const videoRef = useRef<HTMLVideoElement>(null);
    const readyCallbackRef = useRef<(() => void) | null>(null);

    useVideoLoader(media as MediaVideo, videoRef);

    useImperativeHandle(forwardedRef, () => ({
      setCurrentTime: (time: number) => {
        if (!videoRef.current) return;
        // log.debug('[forwardRef] setCurrentTime', time);
        videoRef.current.currentTime = time;
      },
      play: () => {
        if (!videoRef.current) return;
        log.debug('[forwardRef] play');
        // videoRef.current.play();
      },
      pause: () => {
        if (!videoRef.current) return;
        log.debug('[forwardRef] pause');
        // videoRef.current.pause();
      },
      onReady: (callback: () => void) => {
        readyCallbackRef.current = callback;
        // If video is already loaded, call callback immediately
        if ((videoRef.current?.readyState ?? 0) >= 4) {
          callback();
        }
      }
    }));

    const handleVideoStart = useCallback(
      ({ url, isOneShot }: handleVideoStartProps) => {
        if (url !== media.url) return;
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = 0;
        video.play();
      },
      [media.url, videoRef]
    );

    const handleVideoStop = useCallback(
      ({ url }: { url: string }) => {
        if (url !== media.url) return;
        const video = videoRef.current;
        if (!video) return;
        video.pause();
      },
      [media.url, videoRef]
    );

    useEffect(() => {
      events.on('video:start', handleVideoStart);
      events.on('video:stop', handleVideoStop);

      return () => {
        events.off('video:start', handleVideoStart);
        events.off('video:stop', handleVideoStop);
      };
    }, [events, handleVideoStart, handleVideoStop]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const isPlaying =
        video.currentTime > 0 &&
        !video.paused &&
        !video.ended &&
        video.readyState > video.HAVE_CURRENT_DATA;

      if (isVisible && !isPlaying) {
        // video.play();
      } else {
        // video.pause();
      }
    }, [isVisible, videoRef]);

    // Add loadedmetadata event listener
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleLoadedMetadata = () => {
        log.debug('[handleLoadedMetadata] showControls', showControls);
        if (showControls) {
          video.controls = true;
        }
        readyCallbackRef.current?.();
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
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
      const { id, url } = media;

      try {
        const { file } = await loadVideoData(id);

        // Create a blob URL from the video file
        const videoUrl = URL.createObjectURL(file);
        blobUrlRef.current = videoUrl;

        // Set the video source and play
        if (videoRef.current) {
          // log.debug(url, 'setting video src', videoRef.current, videoUrl);
          videoRef.current.src = videoUrl;
          // videoRef.current.currentTime = currentTime;
        }
      } catch (error) {
        log.error('Error loading video:', error);
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
  }, [media]);
};
