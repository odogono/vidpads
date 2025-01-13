import { createLog } from '@helpers/log';
import { MediaYouTube } from '@model/types';
import { parseISO8601Duration } from './datetime';

const log = createLog('youtube');

export const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

export const getYouTubeMetadata = async (
  url: string
): Promise<MediaYouTube | null> => {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) {
      log.debug('env', process.env);
      throw new Error('YouTube API key not configured');
    }

    const fetchUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,player&id=${videoId}&key=${apiKey}`;

    log.debug('Fetching YouTube metadata from:', fetchUrl);

    const response = await fetch(fetchUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch video metadata');
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const videoData = data.items[0];

      log.debug('YouTube metadata:', videoData);

      const duration = videoData.contentDetails.duration;
      const durationInSeconds = parseISO8601Duration(duration)?.toSeconds();
      if (!durationInSeconds) {
        throw new Error('Failed to parse duration');
      }

      log.debug('durationInSeconds', durationInSeconds);

      const metadata: MediaYouTube = {
        id: videoData.id,
        url: 'vidpads://media/' + videoData.id,
        name: videoData.snippet.title,
        sizeInBytes: 0,
        mimeType: 'video/youtube',
        videoId: videoData.id,
        title: videoData.snippet.title,
        description: videoData.snippet.description,
        thumbnails: videoData.snippet.thumbnails,
        duration: durationInSeconds,
        width: parseInt(videoData.player.embedHeight, 10),
        height: parseInt(videoData.player.embedWidth, 10)
      };

      return metadata;
    } else {
      throw new Error('Video not found');
    }
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
const extractVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};
