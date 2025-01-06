declare module 'mp4box' {
  export interface MP4File {
    onError: (error: Error) => void;
    onReady: (info: MP4Info) => void;
    appendBuffer: (chunk: ArrayBuffer & { fileStart: number }) => void;
    flush: () => void;
  }

  export interface MP4Info {
    duration: number;
    timescale: number;
    brand: string;
    compatible_brands: string[];
    created: number;
    modified: number;
    tracks: MP4Track[];
  }

  export interface MP4Track {
    id: number;
    type: string;
    codec: string;
    track_width: number;
    track_height: number;
    timescale: number;
    sample_duration: number;
  }

  export function createFile(): MP4File;
}

export default MP4Box;
