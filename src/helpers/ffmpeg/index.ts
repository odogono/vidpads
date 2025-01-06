import { FFmpeg } from '@ffmpeg/ffmpeg';
import { createLog } from '@helpers/log';

const log = createLog('helpers/ffmpeg');

export const extractVideoThumbnail = async (
  ffmpeg: FFmpeg | null,
  file: File,
  frameTime = '00:00:01',
  size = 384
) => {
  if (!ffmpeg) {
    throw new Error('FFmpeg is not loaded');
  }

  const outputFile = 'poster.jpg';
  const inputDir = '/mounted';
  const inputFile = `${inputDir}/${file.name}`;
  // const inputFile = 'input.mp4';

  try {
    log.debug('[extractVideoThumbnail] getting file data');

    // const fileData = await fetchFile(file);
    // // https://github.com/ffmpegwasm/ffmpeg.wasm/issues/470#issuecomment-1423886323
    // const isValidData = ArrayBuffer.isView(fileData) === true;
    // log.debug('[extractVideoThumbnail] file data is valid', isValidData);

    // log.debug('[extractVideoThumbnail] writing file', fileData);
    // await ffmpeg.writeFile('input.mp4', fileData);

    const dirRoot = await ffmpeg.listDir('/');
    dirRoot.forEach((item) => {
      log.debug('[extractVideoThumbnail] root', item.name);
    });
    // log.debug('[extractVideoThumbnail] directory mounted', dirRoot);

    if (!dirRoot.find((item) => item.name === 'mounted')) {
      await ffmpeg.createDir(inputDir);
    }

    const dirMounted = await ffmpeg.listDir(inputDir);
    // dirMounted.forEach((item) => {
    //   log.debug(`[extractVideoThumbnail] ${inputDir}`, item.name);
    // });

    if (!dirMounted.find((item) => item.name === file.name)) {
      log.debug('[extractVideoThumbnail] mounting file at', inputFile, file);
      await ffmpeg.mount(
        // @ts-expect-error FFSTypes are not yet exported from ffmpeg.wasm
        'WORKERFS',
        {
          files: [file]
        },
        inputDir
      );
    }

    // const directoryMounted = await ffmpeg.listDir(inputDir);
    // log.debug('[extractVideoThumbnail] directory mounted', directoryMounted);
    // Extract a frame as JPG
    // -ss: seek to specified time
    // -frames:v 1: extract only one frame
    // -q:v 2: high quality (lower number = higher quality, range 2-31)
    log.debug('[extractVideoThumbnail] executing ffmpeg op');
    const err = await ffmpeg.exec([
      '-v',
      'error',
      '-ss',
      frameTime,
      '-i',
      inputFile,
      '-frames:v',
      '1',
      '-vf',
      `scale=${size}:${size}:force_original_aspect_ratio=decrease,pad=${size}:${size}:(ow-iw)/2:(oh-ih)/2`,
      '-q:v',
      '2',
      outputFile
    ]);

    // log.debug('[extractVideoThumbnail] ffmpeg exec completed', err);

    if (err !== 0) {
      log.error('[extractVideoThumbnail] ffmpeg exec failed', err);
      return null;
    }

    log.debug('[extractVideoThumbnail] reading thumbnail');

    const data: Uint8Array | string = await ffmpeg.readFile(outputFile);
    log.debug('[extractVideoThumbnail] thumbnail jpg read', data);

    const result = await ffmpegOutputToDataUrl(data, 'image/jpeg');
    // const blob = URL.createObjectURL(new Blob([data], { type: 'image/jpeg' }));
    // const blob = URL.createObjectURL(
    //   new Blob([data], {
    //     type: 'application/octet-stream'
    //   })
    // );

    log.debug('[extractVideoThumbnail] thumbnail url created', result);

    return result;
  } catch (error) {
    log.error(
      '[extractVideoThumbnail] Error extracting video thumbnail:',
      error
    );
    throw error;
  } finally {
    try {
      // log.debug('[extractVideoThumbnail] delete', inputFile);
      // await ffmpeg.deleteFile(inputFile);
      log.debug('[extractVideoThumbnail] delete', outputFile);
      await ffmpeg.deleteFile(outputFile);
      log.debug('[extractVideoThumbnail] unmount', inputDir);
      await ffmpeg.unmount(inputDir);
    } catch (error) {
      log.error('[extractVideoThumbnail] Error deleting files:', error);
    }
  }
};

const ffmpegOutputToDataUrl = async (
  outputData: Uint8Array | string,
  mimeType: string
): Promise<string> => {
  // Convert Uint8Array to regular Array Buffer first
  // const arrayBuffer = outputData.buffer.slice(0);
  const blob = new Blob([outputData], { type: mimeType });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
