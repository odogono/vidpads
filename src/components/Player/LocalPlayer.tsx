import { useEffect, useRef, useState } from 'react';

import { Pause, Play, RotateCcw } from 'lucide-react';

import { createLog } from '@helpers/log';
import { loadVideoData } from '@model/db/api';
import { getMediaIdFromUrl, isVidpadUrl } from '@model/helpers';
import { PlayerProps } from './types';

type LocalPlayerProps = PlayerProps;

const log = createLog('player/local');

export const LocalPlayer = ({
  url,
  isVisible,
  currentTime: currentTimeProp
}: LocalPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isVidpadUrl(url)) return;

    const video = videoRef.current;
    if (!video) return;

    log.debug('render', url, isVisible, currentTime);

    // if we already a player then return
    if (blobUrlRef.current) {
      return;
    }

    const handleTimeUpdate = () => {
      // log.debug('timeupdate', url, video.currentTime);
      // setCurrentTime(video.currentTime);
      // if (loopEnd > 0 && video.currentTime >= loopEnd) {
      //   video.currentTime = loopStart;
      // }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoopEnd(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    (async () => {
      const id = getMediaIdFromUrl(url);
      if (!id) return;

      try {
        const { file } = await loadVideoData(id);

        // Create a blob URL from the video file
        const videoUrl = URL.createObjectURL(file);
        blobUrlRef.current = videoUrl;

        // Set the video source and play
        if (videoRef.current) {
          log.debug('setting video src', videoRef.current, videoUrl);
          videoRef.current.src = videoUrl;
          videoRef.current.currentTime = currentTime;

          // try {
          //   await videoRef.current.play();
          // } catch (error) {
          //   log.error('Error playing video:', error);
          // }
        }
      } catch (error) {
        log.error('Error loading video:', error);
      }
    })();

    return () => {
      log.debug('unmounting', url);
      // Clean up blob URL when component unmounts
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [url]);

  useEffect(() => {
    log.debug('useEffect', isVisible);
    if (!videoRef.current) return;
    videoRef.current.currentTime = currentTimeProp;
    if (isVisible) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isVisible]);

  return (
    <video
      ref={videoRef}
      className={`h-full w-full ${isVisible ? 'block' : 'hidden'}`}
    />
  );
};
