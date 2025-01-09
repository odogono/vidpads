import { useEffect, useRef, useState } from 'react';

import ReactPlayer from 'react-player/youtube';

import { PlayerProps } from './types';

/**
 *
 * See https://github.com/cookpete/react-player
 * @param param0
 * @returns
 */
export const YTPlayer = ({ url, isPlaying, volume, onEnded }: PlayerProps) => {
  const playerRef = useRef<ReactPlayer>(null);
  const [isReady, setIsReady] = useState(false);

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getVideoId(url);

  useEffect(() => {
    if (isReady) {
      const player = playerRef.current?.getInternalPlayer();
      if (player) {
        if (isPlaying) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      }
    }
  }, [isPlaying, isReady]);

  useEffect(() => {
    if (isReady) {
      const player = playerRef.current?.getInternalPlayer();
      if (player) {
        player.setVolume(volume * 100);
      }
    }
  }, [volume, isReady]);

  const handleReady = () => {
    setIsReady(true);
    const player = playerRef.current?.getInternalPlayer();
    if (player) {
      player.setVolume(volume * 100);
      if (isPlaying) {
        player.playVideo();
      }
    }
  };

  const handleEnded = (event: { target: any; data: number }) => {
    onEnded?.();
  };

  if (!videoId) {
    return null;
  }

  return (
    <ReactPlayer
      ref={playerRef}
      videoId={url}
      opts={{
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0
        }
      }}
      onReady={handleReady}
      onEnded={handleEnded}
    />
  );
};
