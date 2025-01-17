import { useEffect, useState } from 'react';

import { createLog } from '@helpers/log';
import { loadImageData } from '@model/db/api';
import { MediaImage } from '@model/types';
import { PlayerProps } from './types';

export type ImagePlayerProps = PlayerProps & {
  media: MediaImage;
};

const log = createLog('player/image');

export const ImagePlayer = ({ media }: ImagePlayerProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      (async () => {
        try {
          const { url: mediaUrl } = media;
          const { blob } = await loadImageData(mediaUrl);
          const url = URL.createObjectURL(blob);
          setImageUrl(url);

          // log.debug('Image loaded successfully');
        } catch (error) {
          log.error('Failed to load image:', error);
        }
      })();
    }

    // Cleanup function to revoke the object URL
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl, media]);

  if (!imageUrl) {
    return <div>Loading...</div>;
  }

  // log.debug('render', media.url, isVisible);

  return (
    <div className={`w-full h-full`}>
      <img
        src={imageUrl}
        alt={media.name}
        className={`w-full h-full object-contain`}
      />
    </div>
  );
};
