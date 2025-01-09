export const MediaType = {
  Image: 'image',
  Video: 'video'
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const OperationType = {
  Source: 'source',
  Duration: 'duration',
  Resize: 'resize',
  Trim: 'trim',
  AddEffect: 'addEffect',
  AddTransition: 'addTransition'
} as const;

export type OperationType = (typeof OperationType)[keyof typeof OperationType];

export interface Operation {
  type: OperationType;
  url: string;
}

export interface SourceOperation extends Operation {
  type: typeof OperationType.Source;
}

export interface DurationOperation extends Operation {
  type: typeof OperationType.Duration;
  start: number;
  duration: number;
}

export interface Pipeline {
  source?: SourceOperation | undefined;
  operations: Operation[];
}

export interface Pad {
  id: string;
  isSelected?: boolean;
  isOneShot?: boolean;
  isLooped?: boolean;
  volume?: number;

  pipeline: Pipeline;
}

type ImageMimeType = 'image/png' | 'image/jpeg' | 'image/jpg' | 'image/webp';
type VideoMimeType = 'video/mp4' | 'video/webm';
type MimeType = ImageMimeType | VideoMimeType;

export interface Media {
  id: string;
  url: string;
  name: string;
  sizeInBytes: number;
  mimeType: MimeType;
  width: number;
  height: number;
  duration: number;
}

export interface MediaImage extends Media {
  mimeType: ImageMimeType;
}

export interface MediaVideo extends Media {
  mimeType: VideoMimeType;
  videoTotalChunks?: number;
}
