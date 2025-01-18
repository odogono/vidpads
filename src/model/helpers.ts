import { Media, MediaType } from './types';

export const getMediaType = (media: Media): MediaType => {
  if (media.mimeType.startsWith('image/')) {
    return MediaType.Image;
  }
  return MediaType.Video;
};

// Add this helper function to parse media URLs
export const getMediaIdFromUrl = (url: string): string | null => {
  if (typeof url !== 'string') {
    return null;
  }
  const match = url.match(/^vidpads:\/\/media\/(.+)$/);
  return match ? match[1] : null;
};

export const isVidpadUrl = (url: string): boolean => {
  return url.startsWith('vidpads://');
};
