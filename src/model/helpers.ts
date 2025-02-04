import { getUnixTimeFromDate, getUnixTimeFromToday } from '@helpers/datetime';
import { StoreContextType } from './store/types';
import { Media, MediaType } from './types';

export const getMediaType = (media: Media): MediaType => {
  if (media.mimeType.startsWith('image/')) {
    return MediaType.Image;
  }
  return MediaType.Video;
};

export const isProjectNoteworthy = (
  project: Partial<StoreContextType>,
  includeEmpty: boolean = false
) => {
  const { projectName, createdAt, updatedAt } = project;
  const lifetime =
    getUnixTimeFromDate(updatedAt) - getUnixTimeFromDate(createdAt);

  if (!includeEmpty && lifetime === 0 && projectName) {
    return false;
  }

  // if it is older than today, and its lifetime is 0, then return false
  if (
    getUnixTimeFromDate(updatedAt) < getUnixTimeFromToday() &&
    lifetime === 0
  ) {
    return false;
  }

  if (!projectName) {
    return false;
  }

  return true;
};
