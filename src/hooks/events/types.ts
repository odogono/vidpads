import {
  PlayerExtractThumbnail,
  PlayerNotReady,
  PlayerPlay,
  PlayerPlaying,
  PlayerReady,
  PlayerSeek,
  PlayerStop,
  PlayerStopped,
  PlayerThumbnailExtracted,
  PlayerTimeUpdate,
  PlayerUpdate
} from '@components/Player/types';
import { Media, MediaYouTube } from '@model/types';

export type EventInputSource =
  | 'keyboard'
  | 'midi'
  | 'pad'
  | 'sequencer'
  | 'step-seq';

export type EventEmitterEvents = {
  'pad:touchdown': {
    padId: string;
    source: EventInputSource;
    requestId?: string;
  };
  'pad:touchup': {
    padId: string;
    source: EventInputSource;
    forceStop?: boolean;
    requestId?: string;
  };
  // request the video to start
  'video:start': PlayerPlay;
  // request the video to stop
  'video:stop': PlayerStop;

  // request the video to seek to a specific time
  'video:seek': PlayerSeek;
  // request the video to extract a thumbnail
  'video:extract-thumbnail': PlayerExtractThumbnail;
  // a thumbnail has been extracted
  'video:thumbnail-extracted': PlayerThumbnailExtracted;
  // the video is ready
  // 'video:ready': PlayerReady;
  // the keyboard is enabled
  'keyboard:enabled': boolean;
  // the player is ready for interaction
  'player:ready': PlayerReady;
  // the player is not ready for interaction
  'player:not-ready': PlayerNotReady;

  'player:playing': PlayerPlaying;
  'player:stopped': PlayerStopped;
  // sent by the player when the time is updated
  'player:time-updated': PlayerTimeUpdate;

  'player:update': PlayerUpdate;
  // 'player:set-volume': PlayerSetVolume;
  // 'player:set-playback-rate': PlayerSetPlaybackRate;

  'control:one-shot': boolean | undefined;
  'control:loop': boolean | undefined;
  'control:resume': boolean | undefined;
  'control:interval-set-start': undefined;
  'control:interval-set-end': undefined;

  'cmd:cancel': undefined;
  'cmd:copy': undefined;
  'cmd:cut': undefined;
  'cmd:paste': { targetPadId: string } | undefined;
  'cmd:arrow': 'left' | 'right' | 'up' | 'down';

  'media:property-update': {
    mediaUrl: string;
    property: keyof Media | keyof MediaYouTube;
    value: unknown;
  };

  'seq:play': undefined;
  'seq:play-toggle': undefined;
  'seq:play-started': {
    time: number;
  };
  'seq:record': undefined;
  'seq:record-started': {
    time: number;
  };
  'seq:stop': {
    time: number;
  };
  'seq:stopped': {
    time: number;
  };
  'seq:rewind': undefined;
  'seq:time-update': SequencerTimeUpdateEvent;
  'seq:playhead-update': {
    time: number;
    playHeadX: number;
    isPlaying: boolean;
    isRecording: boolean;
  };
  'seq:clear-events': undefined;
  'seq:set-time': {
    time: number;
  };
  'seq:set-end-time': {
    time: number; // in secs
  };
};

export interface SequencerTimeUpdateEvent {
  time: number;
  endTime: number;
  isPlaying: boolean;
  isRecording: boolean;
  isStep?: boolean;
}
