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
  frameTime = '00:00:02',
  size = 384
): Promise<string> => {
  log.debug('getting codecs');
  const codec = await getSupportedCodec();
  log.info(`Supported codec: ${codec}`);

  // Get AVC configuration data
  log.info('Getting AVC configuration');
  const description = await getDescription(file);
  log.info('Got AVC configuration', description.length);

  const targetTimeMicros = timeStringToMicroSeconds(frameTime); // Convert to microseconds
  let closestFrame: VideoFrame | null = null;
  let closestDelta = Number.MAX_VALUE;

  // Extract a keyframe from the video
  // const keyframe = await extractKeyframe(file, frameTime);
  // log.info('Got keyframe data', keyframe.byteLength);

  return new Promise(async (resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const decoder = new VideoDecoder({
      output: (frame) => {
        const delta = Math.abs(frame.timestamp - targetTimeMicros);

        if (delta < closestDelta) {
          // If we already had a frame, close it
          if (closestFrame) {
            closestFrame.close();
          }
          closestFrame = frame;
          closestDelta = delta;
          log.debug('decoder/output closest', frame.timestamp);
        } else {
          // Not the closest frame, we can close it
          frame.close();
        }
        // frame.close();
      },
      error: (error) => {
        log.error('decoder/error decoding video:', error);
        reject(error);
      }
    });

    const { width: codedWidth, height: codedHeight } = metadata;

    const config: VideoDecoderConfig = {
      codec,
      codedWidth,
      codedHeight,
      description,
      hardwareAcceleration: 'prefer-hardware'
    };

    const { supported } = await VideoDecoder.isConfigSupported(config);
    if (!supported) {
      reject(new Error('Config not supported'));
      return;
    }

    decoder.configure(config);
    if (decoder.state !== 'configured') {
      reject(new Error('Decoder not configured'));
      return;
    }

    // Create and decode the chunk
    const chunks = await extractFrame(file, frameTime);
    log.info('Got keyframe data', chunks.length);

    // Decode all chunks from keyframe to target frame
    // decoder.decode(chunks[0]);
    for (const chunk of chunks) {
      decoder.decode(chunk);
    }

    // const chunk = new EncodedVideoChunk({
    //   type: 'key',
    //   data: keyframe,
    //   timestamp: timeStringToMicroSeconds(frameTime),
    //   duration: metadata.duration * 1000 // Convert to microseconds
    // });

    // decoder.decode(chunk);

    // this was key - without it nothing happens
    await decoder.flush();

    if (closestFrame) {
      log.debug('toImageData closestFrame', closestFrame.timestamp);
      const imageData = frameToImageData(closestFrame, canvas, ctx, size);

      closestFrame.close();
      resolve(imageData);
    } else {
      reject(new Error('No frame found at specified timestamp'));
    }
  });
};

const frameToImageData = (
  frame: VideoFrame,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  size: number
) => {
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

  return imageData;
};

const getDescription = (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const mp4boxfile = MP4Box.createFile() as MP4File;

    mp4boxfile.onError = (error: unknown) => reject(error);

    mp4boxfile.onReady = (info: MP4Info) => {
      const videoTrack = info.tracks.find(
        (track: { type: string }) => track.type === 'video'
      );
      if (!videoTrack) {
        reject(new Error('No video track found'));
        return;
      }

      const trak = (mp4boxfile as MP4File).getTrackById(videoTrack.id);
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

// const extractFrameAlt = async (
//   file: File,
//   frameTime: string
// ): Promise<EncodedVideoChunk[]> =>
//   new Promise(async (resolve, reject) => {
//     const timestamp = timeStringToSeconds(frameTime);
//     const mp4boxfile = MP4Box.createFile();
//     const videoArrayBuffer = await readFile(file);

//     mp4boxfile.onReady = async (info: MP4Info) => {
//       const videoTrack = info.videoTracks[0];
//       const timescale = videoTrack.timescale;
//       const timeMapping = timestamp * timescale;

//       mp4boxfile.start();
//       const samples = mp4boxfile.getTrackSamplesInfo(videoTrack.id);

//       let start = 0;
//       let end = 0;
//       for (let i = 0; i < samples.length; i += 1) {
//         const si = samples[i];
//         if (si.cts <= timeMapping && si.timeEnd >= timeMapping) {
//           end = i;

//           if (!si.is_sync) {
//             for (let j = i - 1; j >= 0; j -= 1) {
//               const sj = samples[j];
//               if (sj.is_sync) {
//                 start = j;
//                 break;
//               }
//             }
//           }
//           break;
//         }
//       }

//       const chunks = await Promise.all(
//         samples.slice(start, end + 1).map(
//           async (sample: {
//             is_sync: boolean;
//             cts: number;
//             duration: number;
//             data: ArrayBuffer;
//           }) =>
//             new EncodedVideoChunk({
//               type: sample.is_sync ? 'key' : 'delta',
//               timestamp: (sample.cts * 1000000) / timescale,
//               duration: (sample.duration * 1000000) / timescale,
//               data: sample.data
//             })
//         )
//       );
//       if (chunks.length === 0) return resolve([]);
//       resolve(chunks);
//     };

//     //

//     mp4boxfile.onError = (error: unknown) => {
//       reject(error);
//     };

//     mp4boxfile.appendBuffer(videoArrayBuffer);
//     mp4boxfile.flush();
//   });

const extractFrame = async (
  file: File,
  frameTime: string
): Promise<EncodedVideoChunk[]> =>
  new Promise(async (resolve, reject) => {
    const timestamp = timeStringToSeconds(frameTime) + 1;
    const mp4boxfile = MP4Box.createFile();
    const videoArrayBuffer = await readFile(file);

    mp4boxfile.onReady = async (info: MP4Info) => {
      const videoTrack = info.videoTracks[0];
      const timescale = videoTrack.timescale;
      const targetTime = timestamp * timescale;

      log.debug(`targetTime: ${targetTime / timescale}s`);

      // Get samples info - this is still needed but we'll search through it efficiently
      const samples = mp4boxfile.getTrackSamplesInfo(videoTrack.id);

      let start = 0;
      let end = 0;
      for (let i = 0; i < samples.length; i += 1) {
        const si = samples[i];
        log.debug('sample', i, targetTime, si.cts, si.timeEnd);
        if (si.cts <= targetTime && si.timeEnd >= targetTime) {
          end = i;

          if (!si.is_sync) {
            for (let j = i - 1; j >= 0; j -= 1) {
              const sj = samples[j];
              if (sj.is_sync) {
                start = j;
                break;
              }
            }
          }
          break;
        }
      }

      log.debug('foundSamples', start, end, samples.length);

      // const foundSamples = samples
      //   .slice(start, end + 1)
      //   .map((sample: { cts: number }) => {
      //     log.debug('neededSample', sample.cts);
      //     return sample;
      //   });

      // Binary search to find the closest sample
      let left = 0;
      let right = samples.length - 1;
      let targetIndex = 0;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midTime = samples[mid].cts;

        if (midTime === targetTime) {
          targetIndex = mid;
          break;
        } else if (midTime < targetTime) {
          left = mid + 1;
          targetIndex = mid; // Keep track of last sample before target
        } else {
          right = mid - 1;
        }
      }

      // Find the nearest previous keyframe
      let keyframeIndex = targetIndex;
      while (keyframeIndex >= 0 && !samples[keyframeIndex].is_sync) {
        keyframeIndex--;
      }
      if (keyframeIndex < 0) {
        reject(new Error('No keyframe found'));
        return;
      }

      const CHUNK_SIZE = 100;
      const startChunk = Math.floor(keyframeIndex / CHUNK_SIZE);
      let currentChunk = startChunk;
      const neededSamples: EncodedVideoChunk[] = [];

      mp4boxfile.setExtractionOptions(videoTrack.id, null, {
        nbSamples: CHUNK_SIZE
      });

      let endFound = false;

      mp4boxfile.onSamples = (
        track_id: number,
        ref: unknown,
        chunkSamples: {
          cts: number;
          duration: number;
          data: ArrayBuffer;
          is_sync: boolean;
        }[]
      ) => {
        if (currentChunk === startChunk && !endFound) {
          // Collect all samples from keyframe to target
          const startOffset = keyframeIndex % CHUNK_SIZE;
          const endOffset = Math.min(
            startOffset + (targetIndex - keyframeIndex) + 1,
            chunkSamples.length
          );

          for (let i = startOffset; i < endOffset; i++) {
            const sample = chunkSamples[i];

            neededSamples.push(
              new EncodedVideoChunk({
                type: sample.is_sync ? 'key' : 'delta',
                timestamp: (sample.cts * 1000000) / timescale,
                duration: (sample.duration * 1000000) / timescale,
                data: sample.data
              })
            );
            log.debug(
              `sample: ${sample.cts / timescale}s ${timestamp}s`,
              sample
            );
            if (sample.cts > timestamp) {
              endFound = true;
              break;
            }
          }
          resolve(neededSamples);
        } else {
          currentChunk++;
        }
      };

      mp4boxfile.start();
    };

    mp4boxfile.onError = (error: unknown) => {
      reject(error);
    };

    mp4boxfile.appendBuffer(videoArrayBuffer);
    mp4boxfile.flush();
  });

// const extractKeyframe = async (
//   file: File,
//   frameTime: string
// ): Promise<ArrayBuffer> => {
//   return new Promise((resolve, reject) => {
//     const mp4boxfile = MP4Box.createFile() as MP4File;
//     const targetTimeSeconds = timeStringToSeconds(frameTime);
//     let bestSample: any = null;
//     let bestTimeDiff = Infinity;

//     mp4boxfile.onError = (error: unknown) => reject(error);

//     mp4boxfile.onReady = (info: MP4Info) => {
//       const videoTrack = info.tracks.find((track) => track.type === 'video');
//       if (!videoTrack) {
//         reject(new Error('No video track found'));
//         return;
//       }

//       const timescale = videoTrack.timescale;
//       const targetTime = Math.floor(targetTimeSeconds * timescale);

//       // Request a segment around our target time
//       // Look at samples from 2 seconds before to 2 seconds after our target
//       const segmentStart = Math.max(0, targetTime - 2 * timescale);
//       const segmentDuration = 4 * timescale;

//       log.debug('Extracting segment', {
//         targetTime,
//         targetSeconds: targetTimeSeconds,
//         segmentStart,
//         segmentDuration,
//         timescale
//       });

//       mp4boxfile.setSegmentOptions(videoTrack.id, null, {
//         nbSamples: 0, // Get all samples in range
//         rapAlignement: true, // Align to keyframes
//         duration: segmentDuration
//       });

//       mp4boxfile.initializeSegmentation();

//       mp4boxfile.onSegment = (
//         id: number,
//         user: unknown,
//         buffer: ArrayBuffer,
//         sampleNum: number,
//         isLast: boolean
//       ) => {
//         log.debug('Got segment', { id, sampleNum, isLast });

//         // Extract samples from the segment
//         mp4boxfile.setExtractionOptions(videoTrack.id, null, {
//           nbSamples: 0 // Get all samples
//         });
//         mp4boxfile.start();
//       };

//       mp4boxfile.onSamples = (
//         trackId: number,
//         user: unknown,
//         samples: {
//           cts: number;
//           duration: number;
//           data: ArrayBuffer;
//           is_sync: boolean;
//         }[]
//       ) => {
//         log.debug('Got samples', samples.length);

//         // Find the keyframe closest to our target time
//         for (const sample of samples) {
//           if (!sample.is_sync) continue;

//           const sampleTimeSeconds = sample.cts / timescale;
//           const timeDiff = Math.abs(sampleTimeSeconds - targetTimeSeconds);

//           log.debug('Found keyframe', {
//             time: sampleTimeSeconds,
//             diff: timeDiff,
//             cts: sample.cts,
//             is_sync: sample.is_sync
//           });

//           if (timeDiff < bestTimeDiff) {
//             bestTimeDiff = timeDiff;
//             bestSample = sample;
//           }
//         }

//         if (bestSample) {
//           log.debug('Selected keyframe', {
//             time: bestSample.cts / timescale,
//             targetTime: targetTimeSeconds,
//             diff: bestTimeDiff,
//             size: bestSample.data.byteLength
//           });

//           resolve(bestSample.data);
//           mp4boxfile.stop();
//         }
//       };

//       // Start segmentation from our desired point
//       mp4boxfile.seek(segmentStart, true);
//       mp4boxfile.start();
//     };

//     // Read the file
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       if (!e.target?.result) {
//         reject(new Error('Failed to read file'));
//         return;
//       }
//       const arrayBuffer = e.target.result as ArrayBuffer;

//       // Create a proper MP4ArrayBuffer
//       const buffer = arrayBuffer as MP4ArrayBuffer;
//       buffer.fileStart = 0;

//       mp4boxfile.appendBuffer(buffer);
//       mp4boxfile.flush();
//     };
//     reader.readAsArrayBuffer(file);
//   });
// };

const readFile = async (file: File): Promise<MP4ArrayBuffer> => {
  return new Promise((resolve, reject) => {
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
      resolve(buffer);
    };
    reader.readAsArrayBuffer(file);
  });
};
