import { ImagePlayer, ImagePlayerProps } from './ImagePlayer';
import { LocalPlayer } from './PlayerLocal';
import { PlayerYT } from './PlayerYT';
import { PlayerProps } from './types';

export type Player = (props: PlayerProps) => React.ReactElement;

export const Player = (props: PlayerProps) => {
  const isTitle = props.type === 'title';
  const isYouTube = props.type === 'youtube';
  const isVideo = props.type === 'video';
  const isImage = props.type === 'image';

  const playerId = isTitle ? 'title' : props.padId;

  return (
    <div
      className={`vo-player absolute top-0 left-0 w-full h-full`}
      style={{ opacity: props.isVisible ? 1 : 0, zIndex: 0 }}
      data-player-id={playerId}
    >
      {isVideo && <LocalPlayer {...props} />}
      {isYouTube && <PlayerYT {...props} />}
      {isImage && <ImagePlayer {...(props as ImagePlayerProps)} />}
    </div>
  );
};
