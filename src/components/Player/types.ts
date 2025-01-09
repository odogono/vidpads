import { Media } from '@model/types';

export interface PlayerProps {
  ref?: React.RefObject<PlayerRef>;
  isVisible?: boolean;
  media: Media;
  showControls?: boolean;
}

export interface PlayerPlay {
  url: string;
  start?: number;
  end?: number;
  isLoop?: boolean;
  isOneShot?: boolean;
}

export interface PlayerStop {
  url: string;
}

export interface PlayerRef {
  setCurrentTime: (time: number) => void;
  play: (props: PlayerPlay) => void;
  stop: (props: PlayerStop) => void;
  onReady: (callback: () => void) => void;
  getThumbnail: (frameTime: number) => Promise<string | undefined>;
}
