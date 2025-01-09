import {
  isImageMetadata,
  isVideoMetadata,
  isYouTubeMetadata
} from '@helpers/metadata';
import { ImagePlayer } from './ImagePlayer';
import { LocalPlayer } from './LocalPlayer';
import { YTPlayer } from './YTPlayer';
import { PlayerProps } from './types';

export const Player = (props: PlayerProps) => {
  const isVideo = isVideoMetadata(props.media);
  const isYouTube = isYouTubeMetadata(props.media);
  const isImage = isImageMetadata(props.media);

  return (
    <div
      className={`absolute top-0 left-0 w-full h-full ${
        props.isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {isVideo && <LocalPlayer {...props} />}
      {isYouTube && <YTPlayer {...props} />}
      {isImage && <ImagePlayer {...props} />}
    </div>
  );
};
