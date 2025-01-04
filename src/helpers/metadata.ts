import { createLog } from '@helpers/log';
import type { Image, Media, Video } from '@model/types';

const log = createLog('metadata');

export const isVideoMetadata = (metadata: Media): metadata is Video => {
  return 'duration' in metadata;
};

// Add this new function to generate a unique ID
const generateFileId = (file: File): string => {
  // Combine unique properties of the file
  const uniqueString = `${file.name}-${file.size}-${file.lastModified}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < uniqueString.length; i++) {
    const char = uniqueString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to hex string and ensure positive number
  return Math.abs(hash).toString(16);
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
        const metadata: Video = {
          id: fileId,
          url: 'vidpads://media/' + fileId,
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
          sizeInBytes: file.size,
          mimeType: file.type as Video['mimeType'],
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
      const metadata: Image = {
        id: fileId,
        url: 'vidpads://media/' + fileId,
        width: img.width,
        height: img.height,
        sizeInBytes: file.size,
        mimeType: file.type as Image['mimeType'],
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
