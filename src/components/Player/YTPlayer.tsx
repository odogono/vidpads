import { useCallback, useEffect, useRef, useState } from 'react';

import ReactPlayer from 'react-player/youtube';

import { useEvents } from '@helpers/events';
// import YouTube from 'react-youtube';

import { createLog } from '@helpers/log';
import { extractVideoThumbnailFromVideo } from '../../helpers/canvas';
import {
  PlayerExtractThumbnail,
  PlayerPlay,
  PlayerProps,
  PlayerSeek,
  PlayerStop
} from './types';

const log = createLog('YTPlayer');
/**
 *
 * See https://github.com/cookpete/react-player
 * @param param0
 * @returns
 */
export const YTPlayer = ({ media, isVisible, initialTime }: PlayerProps) => {
  const events = useEvents();
  const startTimeRef = useRef(0);
  const endTimeRef = useRef(Number.MAX_SAFE_INTEGER);
  const isLoopedRef = useRef(false);
  const videoRef = useRef<ReactPlayer>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const { id: videoId } = media;

  const handleReady = (args: any) => {
    // setIsReady(true);
    log.debug('ready', media.url, args);
  };

  const handleStart = () => {
    log.debug('start', media.url);
  };

  const handleError = (args: any) => {
    log.debug('error', media.url, args);
  };

  const handleEnded = () => {
    log.debug('ended', media.url);
  };

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    const video = videoRef.current;
    if (!video) return;
    log.debug('progress', media.url, playedSeconds);
    if (playedSeconds >= endTimeRef.current) {
      if (isLoopedRef.current) {
        // log.debug('[handleTimeUpdate] looping', id, startTimeRef.current);
        videoRef.current.seekTo(startTimeRef.current);
      } else {
        stopVideo({ url: media.url });
      }
    }
  };

  const playVideo = useCallback(
    ({ start, end, isLoop, url }: PlayerPlay) => {
      if (!videoRef.current) return;
      if (url !== media.url) return;

      if (isPlaying && isLoopedRef.current) {
        setIsPlaying(false);
        return;
      }
      log.debug('[playVideo]', videoId, { start, end, isLoop, url });

      const startTime = (start ?? 0) === -1 ? 0 : (start ?? 0);
      const endTime =
        (end ?? Number.MAX_SAFE_INTEGER) === -1
          ? Number.MAX_SAFE_INTEGER
          : (end ?? Number.MAX_SAFE_INTEGER);

      startTimeRef.current = startTime;
      endTimeRef.current = endTime;
      isLoopedRef.current = isLoop ?? false;
      log.debug('[playVideo]', videoId, startTime);
      videoRef.current.seekTo(startTime);
      setIsPlaying(true);
    },
    [media.url, videoId]
  );

  const stopVideo = useCallback(
    ({ url }: PlayerStop) => {
      if (url !== media.url) return;
      if (!videoRef.current) return;
      // videoRef.current.pause();
      // isPlayingRef.current = false;
      log.debug('[stopVideo]', videoId);
      setIsPlaying(false);
    },
    [media.url, videoId]
  );

  const seekVideo = useCallback(
    ({ time, url }: PlayerSeek) => {
      // log.debug('[seekVideo]', id, time, { time, url, mediaUrl: media.url });
      if (!videoRef.current) return;
      if (url !== media.url) return;
      // videoRef.current.currentTime = time;

      videoRef.current.seekTo(time);
    },
    [media.url]
  );

  const extractThumbnail = useCallback(
    ({ time, url, additional }: PlayerExtractThumbnail) => {
      if (!videoRef.current) return;
      if (url !== media.url) return;

      events.emit('video:thumbnail-extracted', {
        url,
        time,
        additional
      });

      // log.debug('[extractThumbnail]', id, time);
      // extractVideoThumbnailFromVideo({
      //   video: videoRef.current,
      //   frameTime: time
      // }).then((thumbnail) => {
      //   events.emit('video:thumbnail-extracted', {
      //     url,
      //     time,
      //     thumbnail,
      //     additional
      //   });
      // });
    },
    [media.url, events]
  );

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

  log.debug('[YTPlayer]', videoId, isPlaying);
  return (
    <ReactPlayer
      ref={videoRef}
      className='absolute top-0 left-0 w-full h-full'
      url={`https://www.youtube.com/watch?v=${videoId}`}
      playing={isPlaying}
      width='100%'
      height='100%'
      onReady={handleReady}
      onStart={handleStart}
      onError={handleError}
      onEnded={handleEnded}
      onProgress={handleProgress}
    />
  );
};
