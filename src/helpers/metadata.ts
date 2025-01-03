import { createLog } from '@helpers/log';

export interface ImageMetadata {
  width: number;
  height: number;
  sizeInBytes: number;
  type: string;
  name: string;
}

export interface VideoMetadata extends ImageMetadata {
  duration: number; // in seconds
}

export type MediaMetadata = ImageMetadata | VideoMetadata;

const log = createLog('metadata');

export const isVideoMetadata = (
  metadata: MediaMetadata
): metadata is VideoMetadata => {
  return 'duration' in metadata;
};

export const getMediaMetadata = (file: File): Promise<MediaMetadata> => {
  const isVideo = file.type.startsWith('video/');

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
        const metadata = {
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
          sizeInBytes: file.size,
          type: file.type,
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
      const metadata = {
        width: img.width,
        height: img.height,
        sizeInBytes: file.size,
        type: file.type,
        name: file.name
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
