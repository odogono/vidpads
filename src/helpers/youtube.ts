import { createLog } from '@helpers/log';
import { Media, MediaYouTube } from '@model/types';
import { isYouTubeMetadata, toYTMediaUrl } from './metadata';

const log = createLog('youtube');

export const isYouTubeUrl = (url?: string): boolean =>
  extractVideoId(url) !== undefined;

export const isYouTubeVideoId = (videoId?: string): boolean => {
  if (!videoId) return false;

  // YouTube video IDs are 11 characters long and contain only:
  // - uppercase and lowercase letters (A-Z, a-z)
  // - digits (0-9)
  // - hyphens (-)
  // - underscores (_)
  const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;
  return youtubeIdPattern.test(videoId);
};

export const getYoutubeUrlFromMedia = (media: Media): string | undefined => {
  if (
    media.mimeType.startsWith('video/youtube') &&
    (media as MediaYouTube).videoId
  ) {
    return `https://youtu.be/${(media as MediaYouTube).videoId}`;
  }
  return undefined;
};

export const getYoutubeVideoIdFromUrl = (url?: string): string | undefined => {
  if (!url) {
    return undefined;
  }
  return isYouTubeVideoId(url) ? url : extractVideoId(url);
};

export const getYoutubeVideoIdFromMedia = (
  media: Media
): string | undefined => {
  if (isYouTubeMetadata(media)) {
    return (media as MediaYouTube).videoId;
  }
  return undefined;
};

const fetchFromOEmbed = async (
  videoId: string
): Promise<MediaYouTube | null> => {
  const width = 1280;
  const height = 720;
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&maxwidth=${width}&maxheight=${height}&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch oEmbed data');
  }

  const data = await response.json();

  const ytUrl = toYTMediaUrl(videoId);
  if (!ytUrl) {
    throw new Error(`Failed to generate YouTube URL ${videoId}`);
  }

  const metadata: MediaYouTube = {
    url: ytUrl,
    name: data.title,
    sizeInBytes: -1,
    duration: -1,
    mimeType: 'video/youtube',
    videoId: videoId,
    title: data.title,
    thumbnails: {
      default: {
        url: data.thumbnail_url
      }
    },
    width: data.width,
    height: data.height,
    playbackRates: []
  };

  return metadata;
};

export const getYouTubeMetadata = async (
  url: string
): Promise<MediaYouTube | null> => {
  try {
    // Extract video ID from URL
    const videoId = isYouTubeVideoId(url) ? url : extractVideoId(url);
    if (!videoId) {
      throw new Error(`Invalid YouTube URL ${url}`);
    }

    return fetchFromOEmbed(videoId);
    // return fetchFromYouTubeAPI(videoId);
  } catch (err) {
    log.error('Failed to fetch YouTube metadata:', err);
    return null;
  }
};

export const getYouTubeThumbnail = async (
  data: MediaYouTube
): Promise<string | null> => {
  try {
    const { thumbnails } = data;

    // Get the URL from either standard or default thumbnail
    const thumbnailUrl = thumbnails.high?.url ?? thumbnails.default?.url;

    if (!thumbnailUrl) {
      return null;
    }

    log.debug('Fetching YouTube thumbnail from:', thumbnailUrl);

    // For YouTube thumbnails, we can actually just return the URL directly
    // since they are publicly accessible and don't require CORS handling
    return thumbnailUrl;
  } catch (err) {
    log.error('Failed to fetch YouTube thumbnail:', err);
    return null;
  }
};

// Helper function to extract video ID from YouTube URL
const extractVideoId = (url: string | undefined): string | undefined => {
  if (!url) {
    return undefined;
  }
  // Handle youtube.com/shorts/VIDEO_ID format
  const shortsRegExp = /^.*youtube\.com\/shorts\/([^#&?]*).*/;
  const shortsMatch = url.match(shortsRegExp);
  if (shortsMatch && shortsMatch[1].length === 11) {
    return shortsMatch[1];
  }

  // Handle standard YouTube video URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : undefined;
};
