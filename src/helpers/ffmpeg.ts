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

export const useFFmpeg = ({ loadOnMount = true }: UseFFmpegProps) => {
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

const processVideoInternal = async (ffmpeg: FFmpeg, file: File) => {
  await ffmpeg.writeFile('input.mp4', await fetchFile(file));

  await ffmpeg.exec(['-i', 'input.mp4', '-t', '5', '-c', 'copy', 'output.mp4']);

  const data = await ffmpeg.readFile('output.mp4');
  const processedUrl = URL.createObjectURL(
    new Blob([data], { type: 'video/mp4' })
  );

  return processedUrl;
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
