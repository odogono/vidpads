import { Media } from '@model/types';

export interface PlayerProps {
  isVisible?: boolean;
  currentTime: number;
  media: Media;
  isOneShot?: boolean;
}
