import { useEffect } from 'react';

interface UseVideoEventsProps {
  video: HTMLVideoElement | null;
  onPlaying: () => void;
  onPause: () => void;
  onLoadedMetadata: () => void;
  onSeeking: () => void;
}

export const useVideoEvents = ({
  video,
  onPlaying,
  onPause,
  onLoadedMetadata,
  onSeeking
}: UseVideoEventsProps) => {
  useEffect(() => {
    if (!video) return;

    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('seeking', onSeeking);
    // video.addEventListener('timeupdate', handleTimeUpdate);
    // video.addEventListener('canplay', handleIsReady);
    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('seeking', onSeeking);
      // video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
    };
  }, [video, onPlaying, onPause, onLoadedMetadata]);
};
