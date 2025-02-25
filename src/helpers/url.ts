import {
  getYoutubeVideoIdFromUrl,
  isYouTubeUrl,
  isYouTubeVideoId
} from './youtube';

export interface PadUrlData {
  data: string | undefined;
}

export const safeParseUrl = (
  url: string | undefined | null
): URL | undefined => {
  if (!url) return undefined;
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
};

const scheme = 'odgn-vo://';

const padUrl = `${scheme}pad`;

export const stepSequencerUrl = `${scheme}stepSeq`;

export const createPadUrl = ({ data }: PadUrlData) => {
  const url = new URL(padUrl);
  if (data) {
    url.searchParams.set('d', data);
  }
  return url.toString();
};

export const parsePadUrl = (
  src: string | undefined
): PadUrlData | undefined => {
  if (!src) {
    return undefined;
  }

  if (!src.startsWith(padUrl)) {
    return undefined;
  }

  const url = new URL(src);

  const data = url.searchParams.get('d') ?? undefined;

  return {
    data
  };
};

export const toPadThumbnailUrl = (projectId: string, padId: string): string => {
  return `${scheme}${projectId}/pad/${padId}/thumbnail`;
};

export const fromPadThumbnailUrl = (
  url: string
): { projectId: string; padId: string } => {
  const regex = new RegExp(`^${scheme}([^/]+)/pad/([^/]+)/thumbnail$`);
  const match = url.match(regex);
  if (!match) {
    return { projectId: '', padId: '' };
  }
  return {
    projectId: match[1],
    padId: match[2]
  };
};

export const toLocalFileMediaUrl = (fileId: string): string => {
  return `${scheme}local/${fileId}`;
};

export const toYTMediaUrl = (src: string): string | undefined => {
  const videoId = getYoutubeVideoIdFromUrl(src);
  if (!videoId) {
    return undefined;
  }
  return `https://youtu.be/${videoId}`;
};

export const isYTMediaUrl = (src?: string): boolean => isYouTubeUrl(src);

export const toMediaUrl = (src: string): string | undefined => {
  if (isYouTubeUrl(src)) {
    return toYTMediaUrl(src);
  }

  if (isYouTubeVideoId(src)) {
    return toYTMediaUrl(src);
  }

  return src;
};

export const isValidMediaUrl = (url?: string): boolean => {
  if (!url) return false;

  if (isYouTubeUrl(url)) {
    return true;
  }

  return url.startsWith(scheme);
};

export const isValidSourceUrl = (url?: string): boolean => {
  if (!url) return false;

  if (url.trim() === '') return false;

  // return true if the url starts with http or https and ends with mp4
  if (url.startsWith('http') && url.endsWith('.mp4')) {
    return true;
  }

  if (isYouTubeVideoId(url)) {
    return true;
  }

  if (isYouTubeUrl(url)) {
    return true;
  }

  return false;
};
