import {
  isImageMetadata,
  isVideoMetadata,
  isYouTubeMetadata
} from '@helpers/metadata';
import { ImagePlayer } from './ImagePlayer';
import { LocalPlayer } from './LocalPlayer';
import { PlayerYT } from './PlayerYT';
import { PlayerProps } from './types';

export const Player = (props: PlayerProps) => {
  const isYouTube = isYouTubeMetadata(props.media);
  const isVideo = !isYouTube && isVideoMetadata(props.media);
  const isImage = isImageMetadata(props.media);

  return (
    <div
      className={`absolute top-0 left-0 w-full h-full ${
        props.isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {isVideo && <LocalPlayer {...props} />}
      {isYouTube && <PlayerYT {...props} />}
      {isImage && <ImagePlayer {...props} />}
    </div>
  );
};
