import { createLog } from '@helpers/log';
import { runAfter } from '@helpers/time';
import { safeParseUrl, toLocalFileMediaUrl } from '@helpers/url';
import type { Interval, Media, MediaImage, MediaVideo } from '@model/types';
import { getMediaData } from '../model/db/api';
import { generateFileId } from './file';
import { safeParseFloat } from './number';
import { getYouTubeMetadata, isYouTubeUrl, isYouTubeVideoId } from './youtube';

const log = createLog('metadata', ['debug']);

export const isVideoMetadata = (metadata: Media): boolean => {
  return metadata.mimeType.startsWith('video/');
};

export const isImageMetadata = (metadata: Media): boolean => {
  return metadata.mimeType.startsWith('image/');
};

export const isYouTubeMetadata = (
  metadata?: Media | null | undefined
): boolean => {
  return metadata?.mimeType.startsWith('video/youtube') ?? false;
};

export const getUrlMetadata = async (url?: string): Promise<Media | null> => {
  if (!url) return null;

  const media = await getMediaData(url);

  if (media) {
    return media;
  }

  if (isYouTubeUrl(url) || isYouTubeVideoId(url)) {
    return getYouTubeMetadata(url);
  }

  log.debug('[getUrlMetadata] invalid url:', url);

  return null;
};

export const getIntervalFromUrl = async (
  url?: string
): Promise<Interval | undefined> => {
  log.debug('[getIntervalFromUrl]', url);

  if (!isYouTubeUrl(url)) {
    return undefined;
  }

  const urlObj = safeParseUrl(url);
  if (!urlObj) return undefined;

  const data = urlObj.searchParams.get('t');

  if (!data) return undefined;

  const start = safeParseFloat(data, -1);

  if (start === -1) return undefined;

  return { start, end: -1 };
};

export const getMediaMetadata = (file: File): Promise<Media> => {
  const isVideo = file.type.startsWith('video/');
  const fileId = generateFileId(file);

  if (isVideo) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);

      const cleanup = () => {
        log.debug('Cleaning up video metadata');
        URL.revokeObjectURL(url);
        video.remove();
        log.debug('Video metadata cleaned up');
      };

      // Set a timeout in case the metadata never loads
      const timeoutId = runAfter(5000, () => {
        cleanup();
        reject(new Error('Timeout loading video metadata'));
      });

      video.onerror = () => {
        log.debug('[getMediaMetadata] video.onerror');
        clearTimeout(timeoutId);
        cleanup();
        reject(new Error('Failed to load video'));
      };
      video.onloadedmetadata = () => {
        clearTimeout(timeoutId);
        const metadata: MediaVideo = {
          url: toLocalFileMediaUrl(fileId),
          fileId,
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
          sizeInBytes: file.size,
          mimeType: file.type as MediaVideo['mimeType'],
          name: file.name
        };
        cleanup();
        resolve(metadata);
      };

      video.src = url;
    });
  }

  // Handle images
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(url);
      img.remove();
    };

    // Set a timeout in case the image never loads
    const timeoutId = runAfter(5000, () => {
      cleanup();
      reject(new Error('Timeout loading image metadata'));
    });

    img.onload = () => {
      clearTimeout(timeoutId);
      const metadata: MediaImage = {
        url: toLocalFileMediaUrl(fileId),
        fileId,
        width: img.width,
        height: img.height,
        sizeInBytes: file.size,
        mimeType: file.type as MediaImage['mimeType'],
        name: file.name,
        duration: 0
      };
      cleanup();
      resolve(metadata);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      cleanup();
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};
