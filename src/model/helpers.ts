import { Media, MediaType } from './types';

export const getMediaType = (media: Media): MediaType => {
  if (media.mimeType.startsWith('image/')) {
    return MediaType.Image;
  }
  return MediaType.Video;
};
