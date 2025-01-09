import { MediaVideo } from '../model/types';
import { timeStringToSeconds } from './time';

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

    video.src = URL.createObjectURL(file);

    video.onseeked = () =>
      onVideoSeek({ video, canvas, ctx, size, resolve, reject });

    // Convert frameTime string to seconds
    const seconds = timeStringToSeconds(frameTime);
    video.currentTime = seconds;
  });
};

export const extractVideoThumbnailFromVideo = async (
  video: HTMLVideoElement,
  frameTime = 0,
  size = 384
) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.onseeked = () =>
      onVideoSeek({ video, canvas, ctx, size, resolve, reject });

    video.currentTime = frameTime;

    video.onseeked = () => {
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
    };
  });
};

const onVideoSeek = ({
  video,
  canvas,
  ctx,
  size,
  resolve,
  reject
}: {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  size: number;
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}) => {
  if (!ctx) {
    reject(new Error('Could not get canvas context'));
    return;
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
  resolve(imageData);
};
