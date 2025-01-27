import { StoreContextType } from './store/types';

export type ShowMode = 'pads' | 'sequencer';

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
  AddTransition: 'addTransition',
  Volume: 'volume',
  PlaybackRate: 'playbackRate'
} as const;

export type OperationType = (typeof OperationType)[keyof typeof OperationType];

export interface Operation {
  type: OperationType;
}

export interface SourceOperation extends Operation {
  type: typeof OperationType.Source;
  url: string;
}

export interface PlaybackRateOperation extends Operation {
  type: typeof OperationType.PlaybackRate;
  rate: number;
  preservePitch: boolean;
}

export interface TrimOperation extends Operation {
  type: typeof OperationType.Trim;
  start: number;
  end: number;
}

export type VolumeKeyPoint = {
  time: number;
  value: number;
};

export interface VolumeOperation extends Operation {
  type: typeof OperationType.Volume;
  envelope: VolumeKeyPoint[];
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
  label?: string;
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
  playbackRates: number[];
}

export interface ProjectExport {
  id: string;
  name: string;
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

export interface ProjectLoadedEvent {
  projectId: string;
  projectName: string;
}

export interface ProjectCreatedEvent {
  projectId: string;
  projectName: string;
}
