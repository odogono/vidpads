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
  log.info('Getting AVC configuration');
  const description = await getDescription(file);
  log.info('Got AVC configuration', description.length);

  // Extract a keyframe from the video
  const keyframe = await extractKeyframe(file, frameTime);
  log.info('Got keyframe data', keyframe.byteLength);

  return new Promise(async (resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    let outputReceived = false;

    const decoder = new VideoDecoder({
      output: (frame) => {
        log.debug('decoder/output', frame);
        outputReceived = true;

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

    const { width: codedWidth, height: codedHeight } = metadata;

    log.debug('Configuring decoder', {
      codec,
      codedWidth,
      codedHeight,
      descriptionLength: description.length
    });

    const config: VideoDecoderConfig = {
      codec,
      codedWidth,
      codedHeight,
      description,
      hardwareAcceleration: 'prefer-hardware'
    };

    const supported = await VideoDecoder.isConfigSupported(config);
    log.info('config supported', supported);

    decoder.configure(config);

    log.debug('decoder state post configure', decoder.state);

    // Create and decode the chunk
    const chunk = new EncodedVideoChunk({
      type: 'key',
      data: keyframe,
      timestamp: timeStringToMicroSeconds(frameTime),
      duration: metadata.duration * 1000 // Convert to microseconds
    });

    log.debug('Decoding chunk', {
      type: chunk.type,
      timestamp: chunk.timestamp,
      duration: chunk.duration,
      byteLength: chunk.byteLength
    });

    decoder.decode(chunk);
    decoder.flush();

    // Add a timeout to detect if the decoder is not producing output
    setTimeout(() => {
      if (!outputReceived) {
        log.error('Decoder timeout - no output received');
        reject(new Error('Decoder timeout - no output received'));
      }
    }, 5000); // 5 second timeout
  });
};

const getDescription = (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const mp4boxfile = MP4Box.createFile() as MP4File;

    mp4boxfile.onError = (error) => reject(error);

    mp4boxfile.onReady = (info: MP4Info) => {
      const videoTrack = info.tracks.find((track) => track.type === 'video');
      if (!videoTrack) {
        reject(new Error('No video track found'));
        return;
      }

      const trak = (mp4boxfile as any).getTrackById(videoTrack.id);
      log.debug('Got video track', {
        id: videoTrack.id,
        codec: videoTrack.codec,
        type: videoTrack.type
      });

      for (const entry of trak.mdia.minf.stbl.stsd.entries) {
        const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
        if (box) {
          const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
          box.write(stream);

          const description = new Uint8Array(stream.buffer, 8); // Remove the box header
          log.debug('Got codec description', {
            type: box.type,
            size: description.length,
            data: Array.from(description)
              .map((b) => b.toString(16).padStart(2, '0'))
              .join(' ')
          });
          return resolve(description);
        }
      }

      reject(new Error('avcC, hvcC, vpcC, or av1C box not found'));
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

const extractKeyframe = async (
  file: File,
  frameTime: string
): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const mp4boxfile = MP4Box.createFile() as MP4File;

    mp4boxfile.onError = (error) => reject(error);

    mp4boxfile.onReady = (info: MP4Info) => {
      const videoTrack = info.tracks.find((track) => track.type === 'video');
      if (!videoTrack) {
        reject(new Error('No video track found'));
        return;
      }

      // Set up sample extraction
      mp4boxfile.setExtractionOptions(videoTrack.id, null, {
        nbSamples: 1,
        rapAlignment: true // Request key frame alignment
      });

      // Extract samples
      mp4boxfile.start();

      mp4boxfile.onSamples = (trackId, user, samples) => {
        if (samples.length === 0) {
          reject(new Error('No samples found'));
          return;
        }

        const sample = samples[0];
        if (!sample.is_sync) {
          reject(new Error('Sample is not a key frame'));
          return;
        }

        log.debug('Got keyframe sample', {
          size: sample.data.byteLength,
          is_sync: sample.is_sync,
          description_index: sample.description_index,
          has_redundancy: sample.has_redundancy,
          is_depended_on: sample.is_depended_on,
          is_leading: sample.is_leading,
          depends_on: sample.depends_on
        });

        resolve(sample.data);
      };
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
