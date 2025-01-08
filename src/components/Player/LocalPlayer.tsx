import { useEffect, useRef, useState } from 'react';

// import { Pause, Play, RotateCcw } from 'lucide-react';

import { createLog } from '@helpers/log';
import { loadVideoData } from '@model/db/api';
import { useEvents } from '../../helpers/events';
import { useRenderingTrace } from '../../hooks/useRenderingTrace';
import { MediaVideo } from '../../model/types';
import { PlayerProps } from './types';

type LocalPlayerProps = PlayerProps;

const log = createLog('player/local');

export const LocalPlayer = ({
  isVisible,
  currentTime: currentTimeProp,
  media
}: LocalPlayerProps) => {
  const events = useEvents();
  const videoRef = useRef<HTMLVideoElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(0);
  const [duration, setDuration] = useState(0);

  useVideoLoader(media as MediaVideo, videoRef);

  const handleVideoStart = ({ url }: { url: string }) => {
    if (url !== media.url) return;
    // log.debug('handleVideoStart', media.url);
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
  };

  const handleVideoStop = ({ url }: { url: string }) => {
    if (url !== media.url) return;
    // log.debug('handleVideoStop', media.url);
    const video = videoRef.current;
    if (!video) return;
    video.pause();
  };

  useEffect(() => {
    events.on('video:start', handleVideoStart);
    events.on('video:stop', handleVideoStop);

    return () => {
      events.off('video:start', handleVideoStart);
      events.off('video:stop', handleVideoStop);
    };
  }, [events]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = currentTimeProp;

    const handleTimeUpdate = () => {
      // log.debug('timeupdate', media.url, video.currentTime);
      // setCurrentTime(video.currentTime);
      // if (loopEnd > 0 && video.currentTime >= loopEnd) {
      //   video.currentTime = loopStart;
      // }
    };

    const handleLoadedMetadata = () => {
      // log.debug('loadedmetadata', media.url, video.duration, media.duration);
      // setDuration(video.duration);
      // setLoopEnd(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    const isPlaying =
      video.currentTime > 0 &&
      !video.paused &&
      !video.ended &&
      video.readyState > video.HAVE_CURRENT_DATA;

    if (isVisible && !isPlaying) {
      video.play();
    } else {
      video.pause();
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // log.debug('render', media.url, isVisible, currentTime);

  // useRenderingTrace('LocalPlayer', { media, isVisible, currentTime });

  return (
    <video
      ref={videoRef}
      className={`absolute top-0 left-0 h-full w-full ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};

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
          log.debug(url, 'setting video src', videoRef.current, videoUrl);
          videoRef.current.src = videoUrl;
          // videoRef.current.currentTime = currentTime;
        }
      } catch (error) {
        log.error('Error loading video:', error);
      }
    })();

    return () => {
      log.debug('unmounting', media.url);
      // Clean up blob URL when component unmounts
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [media]);
};
