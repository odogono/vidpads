import { Media } from '@model/types';

export interface PlayerProps {
  ref?: React.RefObject<PlayerRef>;
  isVisible?: boolean;
  currentTime: number;
  media: Media;
  isOneShot?: boolean;
  showControls?: boolean;
}

export interface PlayerRef {
  setCurrentTime: (time: number) => void;
  play: () => void;
  pause: () => void;
  onReady: (callback: () => void) => void;
}
