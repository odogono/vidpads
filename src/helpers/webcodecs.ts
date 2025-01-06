import MP4Box, { DataStream, MP4ArrayBuffer, MP4File, MP4Info } from 'mp4box';

import { createLog } from '@helpers/log';
import { MediaVideo } from '@model/types';
import { timeStringToMicroSeconds, timeStringToSeconds } from './time';

const log = createLog('webcodecs');

if (!('VideoDecoder' in window)) {
  throw new Error('WebCodecs API is not supported in this browser');
}

const getSupportedCodec = async (): Promise<string> => {
  const codecs = ['avc1.42E01E', 'avc1.4D401E', 'avc1.64001E'];

  for (const codec of codecs) {
    const supported = await VideoDecoder.isConfigSupported({
      codec,
      codedWidth: 1920, // Use a common resolution for testing
      codedHeight: 1080
    });
    if (supported.supported) {
      log.info(`Supported codec: ${codec}`);
      return codec;
    }
  }

  throw new Error('No supported video codec found');
};

export const extractVideoThumbnail = async (
  file: File,
  metadata: MediaVideo,
  frameTime = '00:00:01',
  size = 384
): Promise<string> => {
  log.debug('getting codecs');
  const codec = await getSupportedCodec();
  log.info(`Supported codec: ${codec}`);

  // Get AVC configuration data
  const avcConfig = await getAVCConfig(file);
  log.info('Got AVC configuration');

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
        decoder.close();
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

    decoder.configure({
      codec,
      codedWidth,
      codedHeight,
      description: avcConfig
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

const getAVCConfig = async (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const mp4boxfile = MP4Box.createFile() as MP4File;

    mp4boxfile.onError = (error) => reject(error);

    mp4boxfile.onReady = (info: MP4Info) => {
      const videoTrack = info.tracks.find((track) => track.type === 'video');
      if (!videoTrack) {
        reject(new Error('No video track found'));
        return;
      }

      // Get AVC configuration from the video track
      const avcC = (mp4boxfile as any).getTrackById(videoTrack.id)?.mdia?.minf
        ?.stbl?.stsd?.entries[0]?.avcC;

      if (!avcC) {
        reject(new Error('No AVC configuration found'));
        return;
      }

      log.debug('AVC Configuration:', avcC);

      // Get the first SPS and PPS
      const sps = avcC.SPS[0];
      const pps = avcC.PPS[0];

      if (!sps || !pps) {
        reject(new Error('Missing SPS or PPS'));
        return;
      }

      // Create NAL units with start codes
      const startCode = new Uint8Array([0x00, 0x00, 0x00, 0x01]);

      // Combine everything into a single buffer
      const totalSize = startCode.length * 2 + sps.length + pps.length;
      const configData = new Uint8Array(totalSize);

      let offset = 0;

      // Add SPS NAL unit
      configData.set(startCode, offset);
      offset += startCode.length;
      configData.set(new Uint8Array(sps.buffer), offset);
      offset += sps.length;

      // Add PPS NAL unit
      configData.set(startCode, offset);
      offset += startCode.length;
      configData.set(new Uint8Array(pps.buffer), offset);

      log.debug('Created config data', configData.length);
      resolve(configData);
    };

    // Read the file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      const arrayBuffer = e.target.result as ArrayBuffer;

      // Create a proper MP4ArrayBuffer
      const buffer = arrayBuffer as MP4ArrayBuffer;
      buffer.fileStart = 0;

      mp4boxfile.appendBuffer(buffer);
      mp4boxfile.flush();
    };
    reader.readAsArrayBuffer(file);
  });
};
