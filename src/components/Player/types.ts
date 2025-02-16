import { Media } from '@model/types';

export const PlayerReadyState = {
  HAVE_NOTHING: 0,
  HAVE_METADATA: 1,
  HAVE_CURRENT_DATA: 2,
  HAVE_FUTURE_DATA: 3,
  HAVE_ENOUGH_DATA: 4
} as const;

export const PlayerReadyStateKeys = Object.keys(
  PlayerReadyState
) as (keyof typeof PlayerReadyState)[];

export type PlayerReadyState = keyof typeof PlayerReadyState;

export interface PlayerProps {
  id: string;
  padId: string;
  isVisible?: boolean;
  media: Media;
  showControls?: boolean;
  isLoader?: boolean;
  type: 'image' | 'video' | 'youtube' | 'title';
  chokeGroup?: number | undefined;
  playPriority?: number | undefined;
  isResuming?: boolean;
}

export interface PlayerEvent {
  url: string;
  padId: string;
  additional?: PlayerAdditional;
  requestId?: string;
}

export interface PlayerPlaying extends PlayerPlay {
  time: number;
}

export interface PlayerStopped extends PlayerEvent {
  time: number;
}

export interface PlayerTimeUpdate extends PlayerEvent {
  time: number;
  duration: number;
}

export interface PlayerPlay extends PlayerEvent {
  start?: number;
  end?: number;
  isLoop?: boolean;
  loopStart?: number;
  isOneShot?: boolean;
  volume?: number;
  playbackRate?: number;
  isResume?: boolean;
  chokeGroup?: number | undefined;
  playPriority?: number | undefined;
}

// export interface PlayerSetVolume extends PlayerEvent {
//   volume: number;
// }

// export interface PlayerSetPlaybackRate extends PlayerEvent {
//   rate: number;
// }

// properties that can be updated as the player is playing
export interface PlayerUpdate extends PlayerEvent {
  volume?: number | undefined;
  playbackRate?: number | undefined;
  isLoop?: boolean | undefined;
  // isOneShot?: boolean | undefined;
  // isResume?: boolean | undefined;
  chokeGroup?: number | undefined;
  playPriority?: number | undefined;
  // interval?: Interval | undefined;
}

export interface PlayerReady extends PlayerEvent {
  state: number;
  // duration: number;
  // dimensions: {
  //   width: number;
  //   height: number;
  // };
}

export interface PlayerNotReady extends PlayerEvent {
  state: number;
}

export interface PlayerStop extends PlayerEvent {
  time: number;
  all?: boolean;
}

export interface PlayerSeek extends PlayerEvent {
  time: number;
  inProgress: boolean;
  requesterId: string;
  fromId: 'start' | 'end' | 'timeline';
}

interface PlayerAdditional {
  start?: number;
  end?: number;
  isLoop?: boolean;
  isOneShot?: boolean;
  fromId?: 'start' | 'end' | 'timeline';
}

export interface PlayerExtractThumbnail extends PlayerEvent {
  time: number;
  fromId?: 'start' | 'end' | 'timeline';
}

export interface PlayerThumbnailExtracted extends PlayerEvent {
  time: number;
  thumbnail?: string;
  fromId?: 'start' | 'end' | 'timeline';
}

export interface PlayerRef {
  setCurrentTime: (time: number) => void;
  play: (props: PlayerPlay) => void;
  stop: (props: PlayerStop) => void;
  onReady: (callback: () => void) => void;
  getThumbnail: (frameTime: number) => Promise<string | undefined>;
}
