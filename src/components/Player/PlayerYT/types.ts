export const PlayerYTState = {
  UNINITIALIZED: -1,
  READY_FOR_CUE: 0,
  CUEING: 1,
  LOADED: 2,
  READY: 3,
  PLAYING: 4,
  PAUSED: 5,
  ENDED: 6
} as const;

export type PlayerYTState = (typeof PlayerYTState)[keyof typeof PlayerYTState];

export const PlayerState = {
  CREATED: -2,
  DESTROYED: -3,
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
} as const;

export type PlayerState = (typeof PlayerState)[keyof typeof PlayerState];
export type PlayerStateString = keyof typeof PlayerState;

export const IvLoadPolicy = {
  SHOW_VIDEO_ANNOTATIONS: 1,
  HIDE_VIDEO_ANNOTATIONS: 3
} as const;

export type IvLoadPolicy = (typeof IvLoadPolicy)[keyof typeof IvLoadPolicy];
export type IvLoadPolicyString = keyof typeof IvLoadPolicy;

export const Rel = {
  SHOW_CHANNEL_RELATED_VIDEOS: 0,
  SHOW_RELATED_VIDEOS: 1
} as const;

export type Rel = (typeof Rel)[keyof typeof Rel];
export type RelString = keyof typeof Rel;

export interface OnYTErrorEvent {
  data: number;
  target: YTPlayer;
}

export const YTError = {
  INVALID_PARAMETER: 2,
  HTML5_ERROR: 5,
  NOT_FOUND: 100,
  EMBEDDING_API_ERROR: 101,
  EMBEDDING_API_ERROR_ALT: 150
} as const;
