import { createReadStream } from 'fs';

import { createLog } from '../helpers/log';

const log = createLog('mp4');

// MP4 box types
const BOX_TYPES = {
  FTYP: 0x66747970, // 'ftyp' in hex
  MOOV: 0x6d6f6f76, // 'moov'
  MVHD: 0x6d766864, // 'mvhd'
  TRAK: 0x7472616b, // 'trak'
  MDIA: 0x6d646961, // 'mdia'
  MINF: 0x6d696e66, // 'minf'
  STBL: 0x7374626c, // 'stbl'
  STSD: 0x73747364, // 'stsd'
  TKHD: 0x746b6864, // 'tkhd' - track header
  MDHD: 0x6d646864, // 'mdhd' - media header
  HDLR: 0x68646c72, // 'hdlr' - handler reference
  VMHD: 0x766d6864, // 'vmhd' - video media header
  AVC1: 0x61766331, // 'avc1' - AVC/H.264 codec
  HVC1: 0x68766331, // 'hvc1' - HEVC/H.265 codec
  VP09: 0x76703039 // 'vp09' - VP9 codec
} as const;

interface Mp4Box {
  size: number;
  type: number;
  offset: number;
}

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

const readBox = (dataView: DataView, offset: number): Mp4Box | null => {
  if (offset + 8 > dataView.byteLength) return null;

  const size = dataView.getUint32(offset);
  const type = dataView.getUint32(offset + 4);

  // Convert box type to string for debugging
  const typeStr = String.fromCharCode(
    (type >> 24) & 0xff,
    (type >> 16) & 0xff,
    (type >> 8) & 0xff,
    type & 0xff
  );

  log.debug(
    `Found box: ${typeStr} (0x${type.toString(16)}) at offset ${offset}, size ${size}`
  );

  return { size, type, offset };
};

const readBoxes = (dataView: DataView, maxBytes = Infinity): Mp4Box[] => {
  const boxes: Mp4Box[] = [];
  let offset = 0;

  log.debug(
    `Reading boxes from ${offset} to ${Math.min(dataView.byteLength, maxBytes)}`
  );

  while (offset < Math.min(dataView.byteLength, maxBytes)) {
    const box = readBox(dataView, offset);
    if (!box) {
      log.debug(`No more boxes found at offset ${offset}`);
      break;
    }

    if (box.size === 0) {
      log.debug('Found box with size 0, stopping');
      break;
    }

    boxes.push(box);
    offset += box.size;
  }

  log.debug(`Found ${boxes.length} boxes`);
  return boxes;
};

const parseFtypBox = (
  dataView: DataView,
  box: Mp4Box
): Partial<Mp4Metadata> => {
  const majorBrand = String.fromCharCode(
    dataView.getUint8(box.offset + 8),
    dataView.getUint8(box.offset + 9),
    dataView.getUint8(box.offset + 10),
    dataView.getUint8(box.offset + 11)
  );

  const minorVersion = dataView.getUint32(box.offset + 12);
  const compatible_brands: string[] = [];

  // Read compatible brands (each 4 bytes)
  for (let i = 16; i < box.size; i += 4) {
    compatible_brands.push(
      String.fromCharCode(
        dataView.getUint8(box.offset + i),
        dataView.getUint8(box.offset + i + 1),
        dataView.getUint8(box.offset + i + 2),
        dataView.getUint8(box.offset + i + 3)
      )
    );
  }

  return { brand: majorBrand, compatible_brands };
};

const parseMvhdBox = (
  dataView: DataView,
  box: Mp4Box
): Partial<Mp4Metadata> => {
  const version = dataView.getUint8(box.offset + 8);
  let offset = box.offset + 12; // Skip version and flags

  if (version === 1) {
    // 64-bit dates
    const creationTime = new Date(Number(dataView.getBigUint64(offset)) * 1000);
    const modificationTime = new Date(
      Number(dataView.getBigUint64(offset + 8)) * 1000
    );
    offset += 16;
  } else {
    // 32-bit dates
    const creationTime = new Date(dataView.getUint32(offset) * 1000);
    const modificationTime = new Date(dataView.getUint32(offset + 4) * 1000);
    offset += 8;
  }

  const timescale = dataView.getUint32(offset);
  const duration = dataView.getUint32(offset + 4);

  return {
    duration: duration / timescale,
    timescale
  };
};

const parseTrackHeaderBox = (
  dataView: DataView,
  box: Mp4Box
): Partial<Mp4Metadata> => {
  const version = dataView.getUint8(box.offset + 8);
  let offset = box.offset + 12; // Skip version and flags

  // Skip creation and modification times
  offset += version === 1 ? 16 : 8;

  const trackId = dataView.getUint32(offset);
  offset += 8; // Skip trackId and reserved

  // Skip duration
  offset += version === 1 ? 8 : 4;
  offset += 8; // Skip reserved

  // Skip layer and alternate_group
  offset += 4;

  // Skip volume (fixed point 8.8) and reserved
  offset += 4;

  // Read matrix (skip)
  offset += 36;

  // Read dimensions (fixed point 16.16)
  const width = dataView.getUint32(offset) / 65536;
  const height = dataView.getUint32(offset + 4) / 65536;

  return { width, height, videoTrackId: trackId };
};

const parseMediaHeaderBox = (
  dataView: DataView,
  box: Mp4Box
): Partial<Mp4Metadata> => {
  const version = dataView.getUint8(box.offset + 8);
  let offset = box.offset + 12; // Skip version and flags

  // Skip creation and modification times
  offset += version === 1 ? 16 : 8;

  const timeScale = dataView.getUint32(offset);
  const duration =
    version === 1
      ? Number(dataView.getBigUint64(offset + 4))
      : dataView.getUint32(offset + 4);

  return { frameRate: timeScale / duration };
};

const parseSampleDescriptionBox = (
  dataView: DataView,
  box: Mp4Box
): Partial<Mp4Metadata> => {
  const offset = box.offset + 16; // Skip box header, version, flags, and entry count
  const codecType = dataView.getUint32(offset + 4);

  let codec: string;
  switch (codecType) {
    case BOX_TYPES.AVC1:
      codec = 'avc1';
      break;
    case BOX_TYPES.HVC1:
      codec = 'hvc1';
      break;
    case BOX_TYPES.VP09:
      codec = 'vp09';
      break;
    default:
      codec = `unknown (${codecType.toString(16)})`;
  }

  return { codec };
};

/**
 * Parses MP4 metadata from the file header
 * @param input ArrayBuffer or DataView containing the MP4 data
 */
const parseMP4Metadata = (input: ArrayBuffer | DataView): Mp4Metadata => {
  const dataView = input instanceof DataView ? input : new DataView(input);
  const metadata: Mp4Metadata = {};

  log.debug(`Parsing MP4 metadata from buffer of size ${dataView.byteLength}`);
  const boxes = readBoxes(dataView);

  for (const box of boxes) {
    // Convert box type to string for better debugging
    const typeStr = String.fromCharCode(
      (box.type >> 24) & 0xff,
      (box.type >> 16) & 0xff,
      (box.type >> 8) & 0xff,
      box.type & 0xff
    );

    log.debug(`Processing box: ${typeStr} (0x${box.type.toString(16)})`);

    switch (box.type) {
      case BOX_TYPES.FTYP:
        log.debug('found FTYP');
        Object.assign(metadata, parseFtypBox(dataView, box));
        break;

      case BOX_TYPES.MOOV:
        log.debug('found MOOV');
        const moovBoxes = readBoxes(
          new DataView(dataView.buffer, box.offset + 8, box.size - 8)
        );

        // Parse mvhd box
        const mvhdBox = moovBoxes.find((b) => b.type === BOX_TYPES.MVHD);
        if (mvhdBox) {
          Object.assign(metadata, parseMvhdBox(dataView, mvhdBox));
        }

        // Find and parse video track
        for (const trakBox of moovBoxes.filter(
          (b) => b.type === BOX_TYPES.TRAK
        )) {
          const trakBoxes = readBoxes(
            new DataView(dataView.buffer, trakBox.offset + 8, trakBox.size - 8)
          );

          for (const box of trakBoxes) {
            log.debug(box);
          }

          // Parse track header
          const tkhdBox = trakBoxes.find((b) => b.type === BOX_TYPES.TKHD);
          if (tkhdBox) {
            Object.assign(metadata, parseTrackHeaderBox(dataView, tkhdBox));
          }

          // Find media box
          const mdiaBox = trakBoxes.find((b) => b.type === BOX_TYPES.MDIA);
          if (mdiaBox) {
            const mdiaBoxes = readBoxes(
              new DataView(
                dataView.buffer,
                mdiaBox.offset + 8,
                mdiaBox.size - 8
              )
            );

            // Check if this is a video track
            const hdlrBox = mdiaBoxes.find((b) => b.type === BOX_TYPES.HDLR);
            if (hdlrBox) {
              const handlerType = dataView.getUint32(hdlrBox.offset + 16);
              if (handlerType === 0x76696465) {
                // 'vide' in hex
                // Parse media header for frame rate
                const mdhdBox = mdiaBoxes.find(
                  (b) => b.type === BOX_TYPES.MDHD
                );
                if (mdhdBox) {
                  Object.assign(
                    metadata,
                    parseMediaHeaderBox(dataView, mdhdBox)
                  );
                }

                // Find sample description box for codec info
                const minfBox = mdiaBoxes.find(
                  (b) => b.type === BOX_TYPES.MINF
                );
                if (minfBox) {
                  const minfBoxes = readBoxes(
                    new DataView(
                      dataView.buffer,
                      minfBox.offset + 8,
                      minfBox.size - 8
                    )
                  );
                  const stblBox = minfBoxes.find(
                    (b) => b.type === BOX_TYPES.STBL
                  );
                  if (stblBox) {
                    const stblBoxes = readBoxes(
                      new DataView(
                        dataView.buffer,
                        stblBox.offset + 8,
                        stblBox.size - 8
                      )
                    );
                    const stsdBox = stblBoxes.find(
                      (b) => b.type === BOX_TYPES.STSD
                    );
                    if (stsdBox) {
                      Object.assign(
                        metadata,
                        parseSampleDescriptionBox(dataView, stsdBox)
                      );
                    }
                  }
                }
              }
            }
          }
        }
        break;

      default:
        log.debug('found unknown box', box.type.toString(16));
        break;
    }
  }

  return metadata;
};

/**
 * Browser-compatible streaming metadata extraction
 */
const getMP4Metadata = async (stream: ReadableStream): Promise<Mp4Metadata> => {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let bytesRead = 0;
  const INITIAL_READ_SIZE = 1024 * 1024; // Read first 1MB to get metadata

  try {
    while (bytesRead < INITIAL_READ_SIZE) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      bytesRead += value.length;
    }

    // Combine chunks into a single buffer
    const buffer = new Uint8Array(bytesRead);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    return parseMP4Metadata(buffer.buffer);
  } finally {
    reader.releaseLock();
  }
};

// MP4 files start with ftyp box after 4 bytes for size
const MP4_FTYP_SIGNATURE = 0x66747970; // 'ftyp' in hex
const HEADER_SIZE = 12; // We only need the first 12 bytes

type Mp4Input = ArrayBuffer | DataView;

// First, let's create a type for the validation result
interface Mp4ValidationResult {
  isValid: boolean;
  metadata?: Mp4Metadata;
}

/**
 * Validates MP4 header data and extracts metadata
 * @param input ArrayBuffer or DataView containing the MP4 data
 */
const validateMp4Header = (input: Mp4Input): Mp4ValidationResult => {
  try {
    const dataView = input instanceof DataView ? input : new DataView(input);

    if (dataView.byteLength < HEADER_SIZE) {
      log.error('Data is too small to be a valid MP4');
      return { isValid: false };
    }

    const ftypSignature = dataView.getUint32(4);

    if (ftypSignature === MP4_FTYP_SIGNATURE) {
      log.info('✅ Valid MP4 file signature found');
      const metadata = parseMP4Metadata(dataView);
      return { isValid: true, metadata };
    } else {
      log.error('❌ Not a valid MP4 file');
      return { isValid: false };
    }
  } catch (error) {
    log.error('Error reading MP4 data:', error);
    return { isValid: false };
  }
};

/**
 * Browser-compatible streaming validation and metadata extraction
 */
const validateMp4Stream = async (
  stream: ReadableStream
): Promise<Mp4ValidationResult> => {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let bytesRead = 0;
  const INITIAL_READ_SIZE = 1024 * 1024; // Read first 1MB to get metadata

  try {
    while (bytesRead < INITIAL_READ_SIZE) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      bytesRead += value.length;

      // Once we have enough data for basic validation, check if it's an MP4
      if (bytesRead >= HEADER_SIZE) {
        const initialBuffer = new Uint8Array(bytesRead);
        let offset = 0;
        for (const chunk of chunks) {
          initialBuffer.set(chunk, offset);
          offset += chunk.length;
        }

        const dataView = new DataView(initialBuffer.buffer);
        const ftypSignature = dataView.getUint32(4);

        if (ftypSignature !== MP4_FTYP_SIGNATURE) {
          log.error('❌ Not a valid MP4 file');
          return { isValid: false };
        }
      }
    }

    // Combine chunks into a single buffer for metadata parsing
    const buffer = new Uint8Array(bytesRead);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    const metadata = parseMP4Metadata(buffer.buffer);
    return { isValid: true, metadata };
  } catch (error) {
    log.error('Error reading stream:', error);
    return { isValid: false };
  } finally {
    reader.releaseLock();
  }
};

/**
 * Node.js specific streaming validation and metadata extraction
 */
const validateMp4FileFromDisk = async (
  filePath: string
): Promise<Mp4ValidationResult> => {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let bytesRead = 0;
    let isValidMp4 = false;

    // Increase initial read size to 5MB to ensure we get the moov box
    const METADATA_READ_SIZE = 5 * 1024 * 1024;

    const stream = createReadStream(filePath, {
      highWaterMark: 64 * 1024 // Read in 64KB chunks
    });

    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
      bytesRead += chunk.length;

      // Once we have enough data for basic validation, check if it's an MP4
      if (!isValidMp4 && bytesRead >= HEADER_SIZE) {
        const buffer = Buffer.concat(chunks, bytesRead);
        const dataView = new DataView(
          buffer.buffer,
          buffer.byteOffset,
          buffer.byteLength
        );
        const ftypSignature = dataView.getUint32(4);

        if (ftypSignature !== MP4_FTYP_SIGNATURE) {
          stream.destroy();
          resolve({ isValid: false });
          return;
        }

        isValidMp4 = true;
      }

      // Once we have enough data for metadata, stop reading
      if (bytesRead >= METADATA_READ_SIZE) {
        stream.destroy();
        const buffer = Buffer.concat(chunks, bytesRead);
        const dataView = new DataView(
          buffer.buffer,
          buffer.byteOffset,
          buffer.byteLength
        );
        const metadata = parseMP4Metadata(dataView);
        resolve({ isValid: true, metadata });
      }
    });

    stream.on('error', (error) => {
      log.error('Error reading file:', error);
      resolve({ isValid: false });
    });

    stream.on('end', () => {
      if (bytesRead < HEADER_SIZE) {
        log.error('File is too small to be a valid MP4');
        resolve({ isValid: false });
      } else {
        const buffer = Buffer.concat(chunks, bytesRead);
        const metadata = parseMP4Metadata(buffer.buffer);
        resolve({ isValid: true, metadata });
      }
    });
  });
};

// Update the CLI part
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

export {
  validateMp4Header,
  validateMp4Stream,
  getMP4Metadata,
  parseMP4Metadata
};
