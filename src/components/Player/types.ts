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
  isVisible?: boolean;
  media: Media;
  showControls?: boolean;
  initialTime: number;
}

export interface PlayerPlay {
  url: string;
  start?: number;
  end?: number;
  isLoop?: boolean;
  isOneShot?: boolean;
  volume?: number;
}

export interface PlayerReady {
  url: string;
  readyState: PlayerReadyState;
  duration: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface PlayerStop {
  url: string;
}

export interface PlayerStopped {
  url: string;
  time: number;
}

export interface PlayerSeek {
  url: string;
  time: number;
  inProgress: boolean;
  requesterId: string;
}

interface PlayerAdditional {
  start?: number;
  end?: number;
  isLoop?: boolean;
  isOneShot?: boolean;
}

export interface PlayerExtractThumbnail {
  url: string;
  time: number;
  additional?: PlayerAdditional;
}

export interface PlayerThumbnailExtracted {
  url: string;
  time: number;
  thumbnail?: string;
  additional?: PlayerAdditional;
}

export interface PlayerRef {
  setCurrentTime: (time: number) => void;
  play: (props: PlayerPlay) => void;
  stop: (props: PlayerStop) => void;
  onReady: (callback: () => void) => void;
  getThumbnail: (frameTime: number) => Promise<string | undefined>;
}
