import { createLog } from '@helpers/log';
import { MediaVideo } from '@model/types';
import { timeStringToMicroSeconds, timeStringToSeconds } from './time';

const log = createLog('webcodecs');

export const extractVideoThumbnail = async (
  file: File,
  metadata: MediaVideo,
  frameTime = '00:00:01',
  size = 384
): Promise<string> => {
  // First read the file as ArrayBuffer
  const fileData = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const decoder = new VideoDecoder({
      output: (frame) => {
        const { displayWidth: width, displayHeight: height } = frame;

        // Calculate the dimensions to maintain aspect ratio while filling a square
        const scale = Math.max(size / width, size / height);
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        const offsetX = (size - scaledWidth) / 2;
        const offsetY = (size - scaledHeight) / 2;

        canvas.width = size;
        canvas.height = size;

        // Fill with black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, size, size);

        ctx.drawImage(frame, offsetX, offsetY, scaledWidth, scaledHeight);

        const imageData = canvas.toDataURL('image/jpeg', 0.85);

        frame.close();
        resolve(imageData);
      },
      error: (error) => {
        log.error('Error decoding video:', error);
        reject(error);
      }
    });

    // Convert frameTime string to seconds
    const seconds = timeStringToSeconds(frameTime);
    video.currentTime = seconds;

    const { width: codedWidth, height: codedHeight } = metadata;

    // Configure the decoder
    decoder.configure({
      codec: 'h264',
      codedWidth,
      codedHeight
    });

    // Create and decode the chunk
    const chunk = new EncodedVideoChunk({
      type: 'key',
      data: fileData,
      timestamp: timeStringToMicroSeconds(frameTime),
      duration: 0
    });

    decoder.decode(chunk);
  });
};
