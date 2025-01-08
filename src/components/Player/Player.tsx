import { isVideoMetadata } from '@helpers/metadata';
import { ImagePlayer } from './ImagePlayer';
import { LocalPlayer } from './LocalPlayer';
import { PlayerProps } from './types';

export const Player = (props: PlayerProps) => {
  return (
    <div
      className={`absolute top-0 left-0 w-full h-full ${
        props.isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {isVideoMetadata(props.media) ? (
        <LocalPlayer {...props} />
      ) : (
        <ImagePlayer {...props} />
      )}
    </div>
  );
};
