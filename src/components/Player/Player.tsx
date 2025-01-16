import {
  isImageMetadata,
  isVideoMetadata,
  isYouTubeMetadata
} from '@helpers/metadata';
import { ImagePlayer, ImagePlayerProps } from './ImagePlayer';
import { LocalPlayer } from './LocalPlayer';
import { PlayerYT } from './PlayerYT';
import { PlayerProps } from './types';

export type Player = (props: PlayerProps) => React.ReactElement;

export const Player = (props: PlayerProps) => {
  const isYouTube = isYouTubeMetadata(props.media);
  const isVideo = !isYouTube && isVideoMetadata(props.media);
  const isImage = isImageMetadata(props.media);

  return (
    <div
      className={`absolute top-0 left-0 w-full h-full`}
      style={{ opacity: props.isVisible ? 1 : 0, zIndex: 0 }}
      data-player-id={props.padId}
    >
      {isVideo && <LocalPlayer {...props} />}
      {isYouTube && <PlayerYT {...props} />}
      {isImage && <ImagePlayer {...(props as ImagePlayerProps)} />}
    </div>
  );
};
