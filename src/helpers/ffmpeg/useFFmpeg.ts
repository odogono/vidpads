import { useContext } from 'react';

import { FFmpegContext } from './context';

export const useFFmpeg = () => {
  const ffmpeg = useContext(FFmpegContext);

  if (!ffmpeg) {
    throw new Error('FFmpeg not found');
  }

  return ffmpeg;
};
