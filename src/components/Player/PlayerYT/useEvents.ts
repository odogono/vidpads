import { RefObject, useCallback, useEffect } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { Interval } from '@model/types';
import {
  PlayerExtractThumbnail,
  PlayerPlay,
  PlayerSeek,
  PlayerStop
} from '../types';
import { usePlayerYTState } from './state';
import { PlayerState } from './types';

const log = createLog('player/yt/events');

type PlayerYTEvents = {
  player: YTPlayer;
  state: PlayerState;
  stateString: string;
};

export type PlayerYTPlay = PlayerPlay;
export type PlayerYTStop = PlayerStop;
export type PlayerYTSeek = PlayerSeek;
export type PlayerYTExtractThumbnail = PlayerExtractThumbnail & PlayerYTEvents;

export interface UsePlayerYTEventsProps {
  interval: Interval;
  mediaUrl: string;
  padId: string;
  isLoopedRef: RefObject<boolean>;
  startTimeRef: RefObject<number>;
  endTimeRef: RefObject<number>;
  playVideo: (props: PlayerYTPlay) => void;
  stopVideo: (props: PlayerYTStop) => void;
  seekVideo: (props: PlayerYTSeek) => void;
}

export const usePlayerYTEvents = ({
  interval,
  mediaUrl,
  padId: playerPadId,
  isLoopedRef,
  playVideo,
  stopVideo,
  seekVideo
}: UsePlayerYTEventsProps) => {
  const events = useEvents();
  // const [isPlaying, setIsPlaying] = useState(false);

  // const forwardEvent = useCallback(
  //   <T extends PlayerPlay | PlayerStop | PlayerSeek | PlayerExtractThumbnail>(
  //     event: T,
  //     handler: (props: T & PlayerYTEvents) => void
  //   ) => {
  //     const { url } = event;
  //     if (url !== media.url) return;
  //     // const state = player.getPlayerState();
  //     // const stateString = PlayerStateToString(state);
  //     handler({ ...event, player, state, stateString });
  //   },
  //   [media.url, player]
  // );

  const { handlePlayerStateChange } = usePlayerYTState({
    intervals: [interval],
    mediaUrl,
    playerPadId,
    // playVideo: (props: PlayerPlay) => {
    //   const player = playerRef.current;
    //   if (!player) {
    //     log.debug('oh dear no player ref', media.url);
    //     return;
    //   }
    //   const state = player.getPlayerState();
    //   const stateString = PlayerStateToString(state);
    //   playVideo({ ...props, player, url: media.url, state, stateString });
    // },
    playVideo, //: (e: PlayerPlay) => forwardEvent(e, playVideo),
    stopVideo //: (e: PlayerStop) => forwardEvent(e, stopVideo)
  });

  const handleEnded = useCallback(() => {
    log.debug('ended', mediaUrl);
    if (isLoopedRef.current) {
      playVideo({
        url: mediaUrl,
        padId: playerPadId
        // player,
        // state,
        // stateString
      });
      // player.seekTo(startTimeRef.current, true);
      // player.playVideo();
    } else {
      stopVideo({ url: mediaUrl, padId: playerPadId });
    }
  }, [isLoopedRef, mediaUrl, playVideo, stopVideo, playerPadId]);

  const extractThumbnail = useCallback(
    ({ time, url, additional }: PlayerExtractThumbnail) => {
      // sadly, extracting the thumbnail at the current time is not possible
      // with the YouTube API. So the event is emitted anyway to ensure
      // the start and end times are persisted
      events.emit('video:thumbnail-extracted', {
        url,
        time,
        additional,
        padId: playerPadId
      });
    },
    [events, playerPadId]
  );

  const onPlayerCreated = useCallback(
    (player: YTPlayer) => {
      // log.debug('[onPlayerCreated]', player.odgnId);
      handlePlayerStateChange(PlayerState.CREATED, player.odgnId);
    },
    [handlePlayerStateChange]
  );

  const onPlayerDestroyed = useCallback(
    (player: YTPlayer) => {
      // log.debug('[onPlayerDestroyed]', player.odgnId);
      handlePlayerStateChange(PlayerState.DESTROYED, player.odgnId);
    },
    [handlePlayerStateChange]
  );

  const onPlayerReady = useCallback(
    (player: YTPlayer) => {
      // playerRef.current = player;
      // stateStringRef.current = PlayerStateToString(player.getPlayerState());

      // log.debug('[onReady]', media.url, player, {
      //   time: player.getCurrentTime(),
      //   state: PlayerStateToString(player.getPlayerState())
      // });

      // log.debug('[onPlayerReady]', player.odgnId);
      handlePlayerStateChange(player.getPlayerState(), player.odgnId);

      // seek and play in order to buffer
      // as soon as the state changes to playing
      // we can stop it and declare the video ready
      // seekVideo({
      //   player,
      //   url: media.url,
      //   time: 124.7,
      //   inProgress: false,
      //   requesterId: 'yt-player'
      // });
      // player.mute();
      // player.playVideo();
      // target.pauseVideo();
      // target.unMute();

      // log.debug('[onReady]', event.target.getAvailablePlaybackRates());
      // result: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
    },
    [handlePlayerStateChange]
  );

  const onPlayerStateChange = useCallback(
    (player: YTPlayer, state: PlayerState) => {
      switch (state) {
        case PlayerState.PLAYING:
          // events.emit('player:playing', {
          //   url: mediaUrl,
          //   padId: playerPadId,
          //   time: player.getCurrentTime()
          // });
          // setIsPlaying(true);
          break;
        case PlayerState.PAUSED:
          // events.emit('player:stopped', {
          //   url: mediaUrl,
          //   padId: playerPadId,
          //   time: player.getCurrentTime()
          // });
          // setIsPlaying(false);
          break;
        case PlayerState.ENDED:
          handleEnded();
          break;
        default:
          break;
      }
      // stateStringRef.current = PlayerStateToString(state);
      // log.debug(
      //   '[onStateChange]',
      //   player.odgnId,
      //   media.url,
      //   PlayerStateToString(state)
      // );
      handlePlayerStateChange(state, player);
    },
    [mediaUrl, events, handleEnded, handlePlayerStateChange, playerPadId]
  );

  const onPlayerError = useCallback(
    (error: Error) => {
      log.error('[onError]', mediaUrl, error);
    },
    [mediaUrl]
  );

  useEffect(() => {
    const evtStart = playVideo;
    const evtStop = stopVideo;
    const evtSeek = seekVideo;
    const evtExtractThumbnail = (e: PlayerExtractThumbnail) =>
      extractThumbnail(e);

    events.on('video:start', evtStart);
    events.on('video:stop', evtStop);
    events.on('video:seek', evtSeek);
    events.on('video:extract-thumbnail', evtExtractThumbnail);
    return () => {
      events.off('video:start', evtStart);
      events.off('video:stop', evtStop);
      events.off('video:seek', evtSeek);
      events.off('video:extract-thumbnail', evtExtractThumbnail);
    };
  }, [events, extractThumbnail, playVideo, seekVideo, stopVideo]);

  return {
    onPlayerCreated,
    onPlayerDestroyed,
    onPlayerReady,
    onPlayerStateChange,
    onPlayerError
  };
};
