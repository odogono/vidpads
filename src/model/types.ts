export const MediaType = {
  Image: 'image',
  Video: 'video'
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const OperationType = {
  Source: 'source',
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

export interface Pipeline {
  source?: SourceOperation | undefined;
  operations: Operation[];
}

export interface Pad {
  id: string;
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
}

export interface MediaImage extends Media {
  mimeType: ImageMimeType;
}

export interface MediaVideo extends Media {
  mimeType: VideoMimeType;
  duration: number;
  videoTotalChunks?: number;
}
