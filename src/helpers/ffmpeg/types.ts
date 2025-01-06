import { FFmpeg } from '@ffmpeg/ffmpeg';

export interface FFmpegContextType {
  ffmpeg: FFmpeg | null;
  isLoaded: boolean;
}
