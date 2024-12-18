import { useCallback, useRef, useState } from 'react';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { createLogger } from './log';

const log = createLogger('FFmpeg');

export interface UseFFmpegProps {
  loadOnMount?: boolean;
}

export const useFFmpeg = ({ loadOnMount = true }: UseFFmpegProps) => {
  const [isLoaded, setLoaded] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  // const [isPlaying, setIsPlaying] = useState(false);
  // const videoRef = useRef<HTMLVideoElement | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  // const messageRef = useRef<HTMLParagraphElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (loadOnMount && ffmpegRef.current === null) {
    (async () => {
      ffmpegRef.current = await loadFFmpeg();
      setLoaded(true);
    })();
  }

  const processVideo = useCallback(async (file: File) => {
    if (!ffmpegRef.current) {
      ffmpegRef.current = await loadFFmpeg();
    }

    try {
      setIsProcessing(true);

      const processedUrl = await processVideoInternal(ffmpegRef.current, file);

      setIsProcessing(false);
      setVideoUrl(processedUrl);
      return processedUrl;
    } catch (error) {
      log.error('Error processing video:', error);
      alert('Error processing video');
    } finally {
      setIsProcessing(false);
    }
    return null;
  }, []);

  return {
    ffmpeg: ffmpegRef.current,
    processVideo,
    isLoaded,
    isProcessing,
    videoUrl
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
