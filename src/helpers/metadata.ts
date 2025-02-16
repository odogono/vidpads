import { createLog } from '@helpers/log';
import { runAfter } from '@helpers/time';
import type { Media, MediaImage, MediaVideo } from '@model/types';
import { getMediaData } from '../model/db/api';
import { generateFileId } from './file';
import {
  getYouTubeMetadata,
  getYoutubeVideoIdFromUrl,
  isYouTubeUrl,
  isYouTubeVideoId
} from './youtube';

const log = createLog('metadata');

export interface PadUrlData {
  data: string | undefined;
}

const scheme = 'odgn-vo://';

export const createPadUrl = ({ data }: PadUrlData) => {
  const url = new URL(`odgn-vo://pad`);
  if (data) {
    url.searchParams.set('d', data);
  }
  return url.toString();
};

export const parsePadUrl = (
  src: string | undefined
): PadUrlData | undefined => {
  if (!src) {
    return undefined;
  }

  if (!src.startsWith('odgn-vo://pad')) {
    return undefined;
  }

  const url = new URL(src);

  const data = url.searchParams.get('d') ?? undefined;

  return {
    data
  };
};

export const toPadThumbnailUrl = (projectId: string, padId: string): string => {
  return `${scheme}${projectId}/pad/${padId}/thumbnail`;
};

export const fromPadThumbnailUrl = (
  url: string
): { projectId: string; padId: string } => {
  const regex = new RegExp(`^${scheme}([^/]+)/pad/([^/]+)/thumbnail$`);
  const match = url.match(regex);
  if (!match) {
    return { projectId: '', padId: '' };
  }
  return {
    projectId: match[1],
    padId: match[2]
  };
};

export const toLocalFileMediaUrl = (fileId: string): string => {
  return `${scheme}local/${fileId}`;
};

export const toYTMediaUrl = (src: string): string | undefined => {
  const videoId = getYoutubeVideoIdFromUrl(src);
  if (!videoId) {
    return undefined;
  }
  return `https://youtu.be/${videoId}`;
};

export const isYTMediaUrl = (src?: string): boolean => isYouTubeUrl(src);

export const toMediaUrl = (src: string): string | undefined => {
  if (isYouTubeUrl(src)) {
    return toYTMediaUrl(src);
  }

  if (isYouTubeVideoId(src)) {
    return toYTMediaUrl(src);
  }

  return src;
};

export const isValidMediaUrl = (url?: string): boolean => {
  if (!url) return false;

  if (isYouTubeUrl(url)) {
    return true;
  }

  return url.startsWith(scheme);
};

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
