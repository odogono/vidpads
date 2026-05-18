import { createLog } from './log';
import { deflate, inflate } from 'pako';

const log = createLog('helpers/compress');

const bytesToBase64 = (bytes: Uint8Array): string => {
  const CHUNK = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK) as unknown as number[]);
  }
  return btoa(binary);
};

const base64ToBytes = (base64Str: string): Uint8Array => {
  const binaryStr = atob(base64Str);
  return Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
};

export const compress = async (str: string): Promise<string> => {
  try {
    return bytesToBase64(deflate(str));
  } catch (error) {
    log.warn('Error compressing string', error);
    return str;
  }
};

export const decompress = async (base64Str: string): Promise<string> => {
  try {
    const bytes = base64ToBytes(base64Str);
    return inflate(bytes, { to: 'string' });
  } catch (error) {
    log.warn('Error decompressing string', error);
    return base64Str;
  }
};
