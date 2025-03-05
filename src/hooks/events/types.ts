import {
  PlayerExtractThumbnail,
  PlayerNotReady,
  PlayerPlay,
  PlayerPlaying,
  PlayerReady,
  PlayerSeek,
  PlayerSeeked,
  PlayerStop,
  PlayerStopped,
  PlayerThumbnailExtracted,
  PlayerTimeUpdate,
  PlayerUpdate
} from '@components/Player/types';
import { Media, MediaYouTube, SequencerMode } from '@model/types';

export type EventInputSource =
  | 'keyboard'
  | 'midi'
  | 'pad'
  | 'sequencer'
  | 'step-seq';

export interface PadInteractionEvent {
  padId: string;
  source: EventInputSource;
  requestId?: string;
  index?: number;
  forceStop?: boolean;
}

export type EventEmitterEvents = {
  'pad:touchdown': PadInteractionEvent;
  'pad:touchup': PadInteractionEvent;
  // mostly for step sequencer hover
  'pad:enter': PadInteractionEvent;
  'pad:leave': PadInteractionEvent;

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

  'player:seeked': PlayerSeeked;

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
    mode: SequencerMode;
  };
  'seq:record': undefined;
  'seq:record-started': {
    time: number;
    mode: SequencerMode;
  };
  'seq:stop': {
    time: number;
    mode: SequencerMode;
  };
  'seq:stopped': {
    time: number;
    mode: SequencerMode;
  };
  'seq:rewind': undefined;
  // 'seq:time-update': SequencerTimeUpdateEvent;
  'seq:step-update': StepSequencerTimeUpdateEvent;
  'seq:playhead-update': SequencerPlayHeadUpdateEvent;
  'seq:clear-events': undefined;
  'seq:set-time': {
    time: number;
  };
  'seq:set-end-time': {
    time: number; // in secs
  };
};

export interface StepSequencerTimeUpdateEvent {
  bpm: number;
  pattern: number;
  step: number;
  time: number;
}

// export interface SequencerTimeUpdateEvent {
//   time: number;
//   endTime: number;
//   isPlaying: boolean;
//   isRecording: boolean;
//   mode: SequencerMode;
// }

export interface SequencerPlayHeadUpdateEvent {
  time: number;
  playHeadX: number;
  isPlaying: boolean;
  isRecording: boolean;
  mode: SequencerMode;
}
