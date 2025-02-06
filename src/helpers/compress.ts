import { createLog } from './log';

const log = createLog('helpers/compress');

export const compress = async (str: string): Promise<string> => {
  try {
    const compressed = new Blob([str])
      .stream()
      .pipeThrough(new CompressionStream('deflate'));
    const buffer = await new Response(compressed).arrayBuffer();
    // Convert ArrayBuffer to base64 string
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  } catch (error) {
    log.warn('Error compressing string', error);
    return str;
  }
};

export const decompress = async (base64Str: string): Promise<string> => {
  try {
    // Convert base64 string back to ArrayBuffer
    const binaryStr = atob(base64Str);
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
    const decompressed = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream('deflate'));
    return await new Response(decompressed).text();
  } catch (error) {
    log.warn('Error decompressing string', error);
    return base64Str;
  }
};
