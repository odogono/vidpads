import { Media, MediaType } from './types';

export const getMediaType = (media: Media): MediaType => {
  if (media.mimeType.startsWith('image/')) {
    return MediaType.Image;
  }
  return MediaType.Video;
};

export const getMediaIdFromUrl = (url: string): string | null => {
  const match = url.match(/^vidpads:\/\/media\/(.+)$/);
  return match ? match[1] : null;
};
