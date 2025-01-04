import { useCallback, useRef, useState } from 'react';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createLog } from './log';

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

  try {
    await ffmpeg.writeFile('input.mp4', await fetchFile(file));

    // Extract a frame as JPG
    // -ss: seek to specified time
    // -frames:v 1: extract only one frame
    // -q:v 2: high quality (lower number = higher quality, range 2-31)
    await ffmpeg.exec([
      '-ss',
      frameTime,
      '-i',
      'input.mp4',
      '-frames:v',
      '1',
      '-vf',
      `scale=${size}:${size}:force_original_aspect_ratio=decrease,pad=${size}:${size}:(ow-iw)/2:(oh-ih)/2`,
      '-q:v',
      '2',
      'poster.jpg'
    ]);

    const thumbnail = await ffmpeg.readFile('poster.jpg');
    const thumbnailUrl = URL.createObjectURL(
      new Blob([thumbnail], { type: 'image/jpeg' })
    );

    return thumbnailUrl;
  } finally {
    try {
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('poster.jpg');
    } catch (error) {
      log.error('Error deleting files:', error);
    }
  }
};

const loadFFmpeg = async () => {
  const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';
  const ffmpeg = new FFmpeg();
  ffmpeg.on('log', ({ message }) => {
    log.info(message);
    // if (messageRef.current) messageRef.current.innerHTML = message;
  });
  // toBlobURL is used to bypass CORS issue, urls with the same
  // domain can be used directly.
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      'text/javascript'
    )
  });

  return ffmpeg;
};
