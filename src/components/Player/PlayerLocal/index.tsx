import { useCallback, useRef } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { usePlayerState } from '@model/hooks/usePlayerState';
import { MediaVideo } from '@model/types';
import {
  PlayerPlay,
  PlayerPlaying,
  PlayerProps,
  PlayerReadyState,
  PlayerSeek,
  PlayerStop,
  PlayerUpdate
} from '../types';
import { isPlaying } from './helpers';
import { useOnMount } from './hooks/useOnMount';
import { usePlayerLocalEvents } from './hooks/usePlayerLocalEvents';
import { usePlayerLocalTracking } from './hooks/usePlayerLocalTracking';
import { useVideoEvents } from './hooks/useVideoEvents';
import { useVideoLoader } from './hooks/useVideoLoader';

type LocalPlayerProps = PlayerProps;

const log = createLog('player/local', ['debug']);

export const LocalPlayer = ({
  padId: playerPadId,
  showControls,
  media
}: LocalPlayerProps) => {
  const events = useEvents();
  const mediaUrl = media.url;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  // const readyCallbackRef = useRef<(() => void) | null>(null);
  const startTimeRef = useRef(0);
  const endTimeRef = useRef(Number.MAX_SAFE_INTEGER);
  const isLoopedRef = useRef(false);
  // const isPlayingRef = useRef(false);

  const playEventRef = useRef<PlayerPlay | undefined>(undefined);
  const {
    onPlayerUpdate: cOnPlayerUpdate,
    onPlayerDestroyed: cOnPlayerDestroyed
  } = usePlayerState(playerPadId, mediaUrl);

  useVideoLoader(media as MediaVideo, videoRef);

  const seekVideo = useCallback(
    ({ time, url, padId, fromId }: PlayerSeek) => {
      if (!videoRef.current) return;
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;

      if (isPlaying(videoRef.current) && fromId !== 'timeline') {
        return;
      }
      // log.debug('[seekVideo]', id, time, {
      //   time,
      //   url,
      //   mediaUrl: mediaUrl,
      //   fromId
      // });

      videoRef.current.currentTime = time;

      const duration = videoRef.current.duration;

      events.emit('player:time-updated', {
        url: mediaUrl,
        padId: playerPadId,
        time,
        duration
      });
    },
    [mediaUrl, playerPadId, events]
  );

  const { startTimeTracking, stopTimeTracking } = usePlayerLocalTracking({
    video: videoRef.current,
    mediaUrl,
    playerPadId,
    seekVideo,
    // stopVideo,
    endTimeRef,
    startTimeRef,
    isLoopedRef
  });

  const stopVideo = useCallback(
    ({ url, padId, all }: PlayerStop) => {
      if (!all && url !== mediaUrl) return;
      if (!all && padId !== playerPadId) return;
      if (!videoRef.current) return;
      stopTimeTracking();
      videoRef.current.pause();
      // isPlayingRef.current = false;
    },
    [videoRef, mediaUrl, playerPadId, stopTimeTracking]
  );

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

      // if (isPlaying(video) && isLoopedRef.current) {
      //   stopTimeTracking();
      //   video.pause();
      //   // isPlayingRef.current = false;
      //   return;
      // }

      const currentTime = video.currentTime;
      const startTime = (start ?? 0) === -1 ? 0 : (start ?? 0);
      const endTime = Math.min(video.duration, end ?? Number.MAX_SAFE_INTEGER);
      // const endTime =
      //   (end ?? Number.MAX_SAFE_INTEGER) === -1
      // ? Number.MAX_SAFE_INTEGER
      // : (end ?? Number.MAX_SAFE_INTEGER);

      log.debug('playVideo', {
        currentTime,
        startTime,
        endTime,
        end,
        start,
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

      if (isPlaying(video) && isLoopedRef.current) {
        log.debug('playVideo', 'isPlaying/isLoop', startTime);
        // stopTimeTracking();
        // video.pause();
        video.currentTime = startTime;
      } else if (isResume) {
        log.debug('playVideo', 'isResume', startTime);
        if (currentTime < startTime || currentTime > endTime) {
          video.currentTime = startTime;
        }
      } else {
        log.debug('playVideo', 'seeking to start', startTime);
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

      // isPlayingRef.current = true;
      video.play();
      startTimeTracking();
    },
    [mediaUrl, playerPadId, startTimeTracking, stopTimeTracking]
  );

  const stopAll = useCallback(() => {
    if (!videoRef.current) return;
    stopTimeTracking();
    videoRef.current.pause();
    // isPlayingRef.current = false;
  }, [videoRef, stopTimeTracking]);

  const updatePlayer = useCallback(
    ({ url, padId, volume, playbackRate, isLoop }: PlayerUpdate) => {
      if (url !== mediaUrl) return;
      if (padId !== playerPadId) return;
      if (!videoRef.current) return;

      // if (interval !== undefined) {
      //   const { start, end } = interval;
      //   startTimeRef.current = start;
      //   endTimeRef.current = end;
      // }

      if (isLoop !== undefined) {
        isLoopedRef.current = isLoop;
      }

      if (volume !== undefined) {
        videoRef.current.volume = volume;
      }

      if (playbackRate !== undefined) {
        videoRef.current.playbackRate = playbackRate;
      }
    },
    [mediaUrl, playerPadId]
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
    log.debug('handlePaused', playerPadId);
    events.emit('player:stopped', {
      url: mediaUrl,
      padId: playerPadId,
      time: videoRef.current?.currentTime ?? 0
    });
  }, [events, mediaUrl, playerPadId]);

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
    // readyCallbackRef.current?.();

    log.debug('❤️ player:ready', mediaUrl, playerPadId, {
      duration: video.duration
    });

    endTimeRef.current = Math.min(video.duration, endTimeRef.current);

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

  // runs on mount to set the initial value
  useOnMount({
    video: videoRef.current,
    playerPadId
  });

  // events from the HTMLVideoElement
  useVideoEvents({
    video: videoRef.current,
    onPlaying: handlePlaying,
    onPause: handlePaused,
    onLoadedMetadata: handleLoadedMetadata
  });

  // events from the global event system
  usePlayerLocalEvents({
    mediaUrl,
    videoRef,
    playerPadId,
    playVideo,
    stopVideo,
    stopAll,
    seekVideo,
    updatePlayer,
    onPlayerDestroyed: cOnPlayerDestroyed,
    endTimeRef,
    startTimeRef
  });

  // log.debug('❤️ render');
  // useRenderingTrace('LocalPlayer', {
  //   id,
  //   playerPadId,
  //   mediaUrl,
  //   showControls,
  //   media,
  //   startTimeTracking,
  //   stopTimeTracking,
  //   cOnPlayerUpdate,
  //   cOnPlayerDestroyed
  // });

  return <video ref={videoRef} className='vo-player-local w-full h-full' />;
};

LocalPlayer.displayName = 'LocalPlayer';
