import { createLog } from '@helpers/log';
import type { Media, MediaImage, MediaVideo } from '@model/types';
import { generateFileId } from './file';
import { getYouTubeMetadata, isYouTubeUrl, isYouTubeVideoId } from './youtube';

const log = createLog('metadata');

export const isValidSourceUrl = (url?: string): boolean => {
  if (!url) return false;

  if (url.trim() === '') return false;

  // return true if the url starts with http or https and ends with mp4
  if (url.startsWith('http') && url.endsWith('.mp4')) {
    return true;
  }

  if (isYouTubeVideoId(url)) {
    return true;
  }

  if (isYouTubeUrl(url)) {
    return true;
  }

  return false;
};

export const isVideoMetadata = (metadata: Media): boolean => {
  return metadata.mimeType.startsWith('video/');
};

export const isImageMetadata = (metadata: Media): boolean => {
  return metadata.mimeType.startsWith('image/');
};

export const isYouTubeMetadata = (metadata: Media): boolean => {
  return metadata.mimeType.startsWith('video/youtube');
  // return (
  //   metadata.url.includes('youtube.com') || metadata.url.includes('youtu.be')
  // );
};

export const getUrlMetadata = async (url: string): Promise<Media | null> => {
  if (isYouTubeUrl(url) || isYouTubeVideoId(url)) {
    return getYouTubeMetadata(url);
  }

  log.warn('[getUrlMetadata] invalid url:', url);

  return null;
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
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout loading video metadata'));
      }, 5000);

      video.onerror = () => {
        clearTimeout(timeoutId);
        cleanup();
        reject(new Error('Failed to load video'));
      };
      video.onloadedmetadata = () => {
        clearTimeout(timeoutId);
        const metadata: MediaVideo = {
          url: 'vidpads://media/' + fileId,
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
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout loading image metadata'));
    }, 5000);

    img.onload = () => {
      clearTimeout(timeoutId);
      const metadata: MediaImage = {
        url: 'vidpads://media/' + fileId,
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
