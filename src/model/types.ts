import { StoreContextType } from './store/types';

export interface Interval {
  start: number;
  end: number;
}

export const UndefinedInterval: Interval = {
  start: -1,
  end: -1
};

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
}

export interface SourceOperation extends Operation {
  type: typeof OperationType.Source;
  url: string;
}

export interface TrimOperation extends Operation {
  type: typeof OperationType.Trim;
  start: number;
  end: number;
}

export interface Pipeline {
  source?: SourceOperation | undefined;
  operations: Operation[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  store: StoreContextType;
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
type VideoMimeType = 'video/mp4' | 'video/webm' | 'video/youtube';
type MimeType = ImageMimeType | VideoMimeType;

export interface Media {
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
  fileId: string;
}

export interface MediaVideo extends Media {
  mimeType: VideoMimeType;
  videoTotalChunks?: number;
  fileId: string;
}

type Thumbnail = {
  url: string;
  width?: number;
  height?: number;
};

export interface MediaYouTube extends Media {
  mimeType: 'video/youtube';
  videoId: string;
  title: string;
  description?: string;
  thumbnails: {
    default?: Thumbnail;
    medium?: Thumbnail;
    standard?: Thumbnail;
    high?: Thumbnail;
  };
}

export interface ProjectExport {
  id: string;
  name: string;
  version: string;
  exportVersion: string;
  createdAt: string;
  updatedAt: string;
  pads: PadExport[];
}

export interface PadExport {
  id: string;
  source: string;
  operations?: OperationExport[] | undefined;
}

export type OperationExport = Operation;
