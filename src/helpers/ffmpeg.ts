import { useCallback, useRef, useState } from 'react';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createLog } from './log';

const useMultiThreadedFFmpeg = false;
const CORE_VERSION = '0.12.6';
const baseURLCore = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;
const baseURLCoreMT = `https://unpkg.com/@ffmpeg/core-mt@${CORE_VERSION}/dist/esm`;

const log = createLog('FFmpeg');

export interface UseFFmpegProps {
  loadOnMount?: boolean;
}

const useFFmpegLoader = (isEnabled: boolean) => {
  return useSuspenseQuery({
    queryKey: ['ffmpeg', isEnabled],
    queryFn: () => {
      if (!isEnabled) {
        return null;
      }
      return loadFFmpeg();
    },
    gcTime: Infinity
  });
};

export const useFFmpeg = ({ loadOnMount = true }: UseFFmpegProps = {}) => {
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const { data: ffmpeg, isSuccess: isLoaded } = useFFmpegLoader(loadOnMount);

  if (!ffmpegRef.current) {
    ffmpegRef.current = ffmpeg;
    log.debug('FFmpeg loaded', !!ffmpeg);
  }

  const processVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!ffmpegRef.current) {
        ffmpegRef.current = await loadFFmpeg();
      }
      return processVideoInternal(ffmpegRef.current, file);
    },
    onError: (error) => {
      log.error('Error processing video:', error);
      alert('Error processing video');
    }
  });

  return {
    ffmpeg: ffmpegRef.current,
    processVideo: processVideoMutation.mutate,
    isLoaded,
    isProcessing: processVideoMutation.isPending,
    videoUrl: processVideoMutation.data ?? null,
    error: processVideoMutation.error,
    reset: processVideoMutation.reset
  };
};

export const useThumbnail = (file: File) => {
  const { ffmpeg } = useFFmpeg();

  return useSuspenseQuery({
    queryKey: ['thumbnail', file],
    queryFn: () => extractVideoThumbnail(ffmpeg, file)
  });
};

const processVideoInternal = async (ffmpeg: FFmpeg, file: File) => {
  await ffmpeg.writeFile('input.mp4', await fetchFile(file));

  await ffmpeg.exec(['-i', 'input.mp4', '-t', '5', '-c', 'copy', 'output.mp4']);

  const data = await ffmpeg.readFile('output.mp4');
  const processedUrl = URL.createObjectURL(
    new Blob([data], { type: 'video/mp4' })
  );

  return processedUrl;
};

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
    // const fileData = file;
    // const fileData = await fetchFile(file);
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

    const data = await ffmpeg.readFile(outputFile);
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
  outputData: any,
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

const loadFFmpeg = async () => {
  const ffmpeg = new FFmpeg();
  ffmpeg.on('log', ({ message }) => {
    log.debug('[core]', message);
  });

  if (useMultiThreadedFFmpeg && window.crossOriginIsolated) {
    log.debug('multi-threaded');
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${baseURLCoreMT}/ffmpeg-core.js`,
        'text/javascript'
      ),
      wasmURL: await toBlobURL(
        `${baseURLCoreMT}/ffmpeg-core.wasm`,
        'application/wasm'
      ),
      workerURL: await toBlobURL(
        `${baseURLCoreMT}/ffmpeg-core.worker.js`,
        'text/javascript'
      )
    });
  } else {
    log.debug('single-threaded');
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${baseURLCore}/ffmpeg-core.js`,
        'text/javascript'
      ),
      wasmURL: await toBlobURL(
        `${baseURLCore}/ffmpeg-core.wasm`,
        'application/wasm'
      )
    });
  }

  return ffmpeg;
};
