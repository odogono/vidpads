import { useRef } from 'react';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { createLog } from '@helpers/log';
import { useSuspenseQuery } from '@tanstack/react-query';
import { FFmpegContext } from './context';

const useMultiThreadedFFmpeg = true;
const CORE_VERSION = '0.12.6';
const baseURLCore = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;
const baseURLCoreMT = `https://unpkg.com/@ffmpeg/core-mt@${CORE_VERSION}/dist/esm`;

const log = createLog('FFmpegProvider');

export interface FFmpegProviderProps extends React.PropsWithChildren {
  loadOnMount?: boolean;
}

export const FFmpegProvider: React.FC<FFmpegProviderProps> = ({
  children,
  loadOnMount = true
}) => {
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const { data: ffmpeg, isSuccess: isLoaded } = useFFmpegLoader(loadOnMount);

  if (!ffmpegRef.current && isLoaded) {
    ffmpegRef.current = ffmpeg;
    log.debug('FFmpeg loaded', !!ffmpeg);
  }

  return (
    <FFmpegContext.Provider value={{ ffmpeg: ffmpegRef.current, isLoaded }}>
      {children}
    </FFmpegContext.Provider>
  );
};

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
