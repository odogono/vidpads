import { createReadStream } from 'fs';

import MP4Box, { MP4Info, MP4Track } from 'mp4box';

import { createLog } from '../helpers/log';

const log = createLog('mp4');

interface Mp4Metadata {
  duration?: number;
  width?: number;
  height?: number;
  codec?: string;
  brand?: string;
  compatible_brands?: string[];
  created?: Date;
  modified?: Date;
  timescale?: number;
  frameRate?: number;
  videoTrackId?: number;
}

const convertToMetadata = (
  info: MP4Info,
  videoTrack?: MP4Track
): Mp4Metadata => {
  const metadata: Mp4Metadata = {
    duration: info.duration / info.timescale,
    timescale: info.timescale,
    brand: info.brand,
    compatible_brands: info.brands,
    created: new Date(info.created),
    modified: new Date(info.modified)
  };

  if (videoTrack) {
    metadata.width = videoTrack.track_width;
    metadata.height = videoTrack.track_height;
    metadata.codec = videoTrack.codec;
    metadata.frameRate =
      (videoTrack.samples_duration * videoTrack.timescale) / info.duration;
    metadata.videoTrackId = videoTrack.id;
  }

  log.debug('metadata', videoTrack);

  return metadata;
};

interface Mp4ValidationResult {
  isValid: boolean;
  metadata?: Mp4Metadata;
}

/**
 * Browser-compatible streaming validation and metadata extraction
 */
const validateMp4Stream = async (
  stream: ReadableStream
): Promise<Mp4ValidationResult> => {
  return new Promise((resolve) => {
    const mp4boxfile = MP4Box.createFile();
    let metadata: Mp4Metadata | undefined;
    let offset = 0;

    mp4boxfile.onError = (error) => {
      log.error('Error parsing MP4:', error);
      resolve({ isValid: false });
    };

    mp4boxfile.onReady = (info) => {
      const videoTrack = info.tracks.find((track) => track.type === 'video');
      metadata = convertToMetadata(info, videoTrack);
      resolve({ isValid: true, metadata });
    };

    // Set up streaming
    const reader = stream.getReader();
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = value.buffer;
          const arrayBuffer = chunk.slice(0);
          (arrayBuffer as ArrayBuffer & { fileStart?: number }).fileStart =
            offset;
          offset += chunk.byteLength;

          mp4boxfile.appendBuffer(arrayBuffer);
        }
        mp4boxfile.flush();
      } catch (error) {
        log.error('Error reading stream:', error);
        resolve({ isValid: false });
      } finally {
        reader.releaseLock();
      }
    };

    pump();
  });
};

/**
 * Node.js specific streaming validation and metadata extraction
 */
const validateMp4FileFromDisk = async (
  filePath: string
): Promise<Mp4ValidationResult> => {
  return new Promise((resolve) => {
    const mp4boxfile = MP4Box.createFile();
    let metadata: Mp4Metadata | undefined;
    let offset = 0;

    mp4boxfile.onError = (error) => {
      log.error('Error parsing MP4:', error);
      resolve({ isValid: false });
    };

    mp4boxfile.onReady = (info) => {
      const videoTrack = info.tracks.find((track) => track.type === 'video');
      metadata = convertToMetadata(info, videoTrack);
      resolve({ isValid: true, metadata });
    };

    const stream = createReadStream(filePath);

    stream.on('data', (chunk: Buffer) => {
      const arrayBuffer = chunk.buffer.slice(
        chunk.byteOffset,
        chunk.byteOffset + chunk.byteLength
      );
      (arrayBuffer as ArrayBuffer & { fileStart?: number }).fileStart = offset;
      offset += chunk.length;

      mp4boxfile.appendBuffer(arrayBuffer);
    });

    stream.on('end', () => {
      mp4boxfile.flush();
    });

    stream.on('error', (error) => {
      log.error('Error reading file:', error);
      resolve({ isValid: false });
    });
  });
};

// CLI part
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    log.error('Please provide a path to an MP4 file');
    process.exit(1);
  }

  const filePath = args[0];

  validateMp4FileFromDisk(filePath)
    .then(({ isValid, metadata }) => {
      if (isValid && metadata) {
        log.info('MP4 Metadata:', metadata);
      }
      process.exit(isValid ? 0 : 1);
    })
    .catch((error) => {
      log.error('Error:', error);
      process.exit(1);
    });
}

export { validateMp4Stream, validateMp4FileFromDisk };
