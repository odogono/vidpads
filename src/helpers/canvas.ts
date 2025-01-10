import { createLog } from '@helpers/log';
import { timeStringToSeconds } from '@helpers/time';
import { MediaVideo } from '@model/types';

const log = createLog('Canvas');

export const extractVideoThumbnail = async (
  file: File,
  _metadata: MediaVideo,
  frameTime = '00:00:01',
  size = 384
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const cleanup = () => {
      video.onseeked = null;
      video.src = '';
      video.currentTime = 0;
      video.pause();
      video.remove();
      canvas.remove();
    };

    // safari seems to better cope with a FileReader
    // rather than using URL.createObjectURL - despite
    // the fact the former uses more memory
    const reader = new FileReader();
    reader.onload = (e) => {
      video.src = e.target?.result as string;
    };

    reader.onerror = (e) => {
      log.error('[extractVideoThumbnail] reader.error', e);
      cleanup();
      reject(e);
    };
    reader.readAsDataURL(file);

    video.onseeked = () => {
      const { imageData, error } = onVideoSeek({ video, canvas, ctx, size });
      if (error) {
        cleanup();
        reject(error);
      } else {
        cleanup();
        resolve(imageData);
      }
    };

    // Convert frameTime string to seconds
    const seconds = timeStringToSeconds(frameTime);
    video.currentTime = seconds;
  });
};

export interface ExtractVideoThumbnailFromVideoProps {
  video: HTMLVideoElement;
  frameTime: number;
  size?: number;
}

export const extractVideoThumbnailFromVideo = async ({
  video,
  frameTime,
  size = 384
}: ExtractVideoThumbnailFromVideoProps): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const existingOnSeek = video.onseeked;

    const cleanup = () => {
      video.onseeked = existingOnSeek;
      canvas.remove();
    };

    video.onseeked = () => {
      const { imageData, error } = onVideoSeek({ video, canvas, ctx, size });
      if (error) {
        cleanup();
        reject(error);
      } else {
        cleanup();
        resolve(imageData);
      }
    };

    log.debug('[extractVideoThumbnailFromVideo] seek', frameTime);
    video.currentTime = frameTime;
  });
};

const onVideoSeek = ({
  video,
  canvas,
  ctx,
  size
  // resolve,
  // reject
}: {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  size: number;
  // resolve: (value: string) => void;
  // reject: (reason?: unknown) => void;
}) => {
  log.debug('onVideoSeek');

  if (!ctx) {
    return { error: new Error('Could not get canvas context') };
  }

  // Calculate the dimensions to maintain aspect ratio while filling a square
  const scale = Math.max(size / video.videoWidth, size / video.videoHeight);
  const scaledWidth = video.videoWidth * scale;
  const scaledHeight = video.videoHeight * scale;
  const offsetX = (size - scaledWidth) / 2;
  const offsetY = (size - scaledHeight) / 2;

  canvas.width = size;
  canvas.height = size;

  // Fill with black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  ctx.drawImage(video, offsetX, offsetY, scaledWidth, scaledHeight);

  const imageData = canvas.toDataURL('image/jpeg', 0.85);
  // log.debug('[onVideoSeek] imageData', imageData);
  return { imageData };
};
