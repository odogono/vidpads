import { useCallback, useEffect } from 'react';

import { extractVideoThumbnail as extractVideoThumbnailCanvas } from '@helpers/canvas';
import { createImageThumbnail } from '@helpers/image';
import { useKeyboard } from '@helpers/keyboard';
import { createLog } from '@helpers/log';
import {
  getMediaMetadata,
  getUrlMetadata,
  isVideoMetadata,
  isYouTubeMetadata
} from '@helpers/metadata';
import {
  copyPadThumbnail as dbCopyPadThumbnail,
  deleteMediaData as dbDeleteMediaData,
  deletePadThumbnail as dbDeletePadThumbnail,
  getAllMediaMetaData as dbGetAllMediaMetaData,
  getMediaData as dbGetMediaData,
  getPadThumbnail as dbGetPadThumbnail,
  saveImageData as dbSaveImageData,
  saveUrlData as dbSaveUrlData,
  saveVideoData as dbSaveVideoData,
  setPadThumbnail as dbSetPadThumbnail
} from '@model/db/api';
import { getPadById, getPadsBySourceUrl } from '@model/store/selectors';
import { StoreType } from '@model/store/types';
import { MediaImage, MediaVideo, MediaYouTube, Pad } from '@model/types';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { getYouTubeThumbnail } from '../helpers/youtube';
import { getPadSourceUrl } from './pad';
import { useStore } from './store/useStore';

const log = createLog('model/api');

const QUERY_KEY_PAD_THUMBNAIL = 'pad-thumbnail';

export interface AddFileToPadProps {
  file: File;
  padId: string;
  store?: StoreType;
}

export interface AddUrlToPadProps {
  url: string;
  padId: string;
  store?: StoreType;
}

export const getAllMediaMetaData = async () => {
  return dbGetAllMediaMetaData();
};

export const useMetadataFromPad = (pad?: Pad) => {
  const queryClient = useQueryClient();

  // Invalidate the cache when pad changes
  useEffect(() => {
    if (pad) {
      queryClient.invalidateQueries({
        queryKey: ['metadata/pad', pad.id]
      });
    }
  }, [pad, queryClient]);

  return useSuspenseQuery({
    queryKey: ['metadata/pad', pad?.id],
    queryFn: async () => {
      if (!pad) return null;

      const sourceUrl = getPadSourceUrl(pad);
      if (!sourceUrl) return null;

      const media = await dbGetMediaData(sourceUrl);

      return media ?? null;
    }
  });
};

export const usePadThumbnail = (pad: Pad) => {
  return useSuspenseQuery({
    queryKey: [QUERY_KEY_PAD_THUMBNAIL, pad.id],
    queryFn: async () => {
      try {
        const thumbnail = await dbGetPadThumbnail(pad.id);
        return thumbnail;
      } catch {
        // log.warn('[usePadThumbnail] Error getting thumbnail:', error);
        return null;
      }
    }
  });
};

export interface UsePadTrimOperationProps {
  pad: Pad;
  start: number;
  end: number;
  thumbnail?: string;
}

export const usePadTrimOperation = () => {
  const { store } = useStore();
  const queryClient = useQueryClient();

  return async ({ pad, start, end, thumbnail }: UsePadTrimOperationProps) => {
    store.send({
      type: 'applyTrimToPad',
      padId: pad.id,
      start,
      end
    });

    if (thumbnail) {
      await dbSetPadThumbnail(pad.id, thumbnail);

      // Invalidate the pad-thumbnail query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PAD_THUMBNAIL, pad.id]
      });
    }

    return pad;
  };
};

export interface CopyPadToPadProps {
  sourcePadId: string;
  targetPadId: string;
}

export const usePadOperations = () => {
  const { store } = useStore();
  const queryClient = useQueryClient();
  const { isShiftKeyDown } = useKeyboard();

  const addFileToPadOp = useCallback(
    async (props: AddFileToPadProps) => {
      const metadata = await addFileToPad({ ...props, store });

      // Invalidate the pad-thumbnail query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PAD_THUMBNAIL, props.padId]
      });

      return metadata;
    },
    [queryClient, store]
  );

  const addUrlToPadOp = useCallback(
    async (props: AddUrlToPadProps) => {
      const metadata = await addUrlToPad({ ...props, store });

      // Invalidate the pad-thumbnail query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PAD_THUMBNAIL, props.padId]
      });

      return metadata;
    },
    [store, queryClient]
  );

  const copyPadToPadOp = useCallback(
    async ({ sourcePadId, targetPadId }: CopyPadToPadProps) => {
      const targetPad = getPadById(store, targetPadId);
      if (!targetPad) {
        log.warn('[copyPad] Pad not found:', targetPadId);
        return false;
      }

      // clear the target pad
      await deletePadMedia(store, targetPad);

      await dbCopyPadThumbnail(sourcePadId, targetPadId);

      store.send({
        type: 'copyPad',
        sourcePadId,
        targetPadId,
        copySourceOnly: isShiftKeyDown()
      });

      // Invalidate the pad-thumbnail query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PAD_THUMBNAIL, sourcePadId]
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PAD_THUMBNAIL, targetPadId]
      });
      return true;
    },
    [store, queryClient, isShiftKeyDown]
  );

  const clearPadOp = useCallback(
    async (padId: string) => {
      const pad = getPadById(store, padId);
      if (!pad) {
        log.warn('[clearPad] Pad not found:', padId);
        return false;
      }

      await deletePadMedia(store, pad);

      store.send({
        type: 'clearPad',
        padId
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PAD_THUMBNAIL, padId]
      });
      return true;
    },
    [store, queryClient]
  );

  return {
    addFileToPad: addFileToPadOp,
    addUrlToPad: addUrlToPadOp,
    copyPadToPad: copyPadToPadOp,
    clearPad: clearPadOp
  };
};

export const addUrlToPad = async ({ url, padId, store }: AddUrlToPadProps) => {
  if (!store) {
    log.warn('Store not found');
    return null;
  }

  // determine the type of url
  const metadata = await getUrlMetadata(url);

  if (!metadata) {
    log.warn('[addUrlToPad] No metadata found for url:', url);
    return null;
  }

  log.debug('[addUrlToPad] url:', url, padId);

  // fetch the thumbnail
  const thumbnail = await getYouTubeThumbnail(metadata as MediaYouTube);

  if (!thumbnail) {
    log.warn('[addUrlToPad] No thumbnail found for url:', url);
    return null;
  }

  await dbSaveUrlData({
    metadata: metadata as MediaYouTube,
    thumbnail
  });

  log.debug('[addUrlToPad] thumbnail:', metadata.id, thumbnail);

  await dbSetPadThumbnail(padId, thumbnail);

  // Update the store with the tile's video ID
  store.send({
    type: 'setPadMedia',
    padId,
    media: metadata
  });

  return metadata;
};

/**
 * Adds a file to a pad and generates a thumbnail
 *
 * @param file
 * @param padId
 * @param store
 * @returns
 */
export const addFileToPad = async ({
  file,
  padId,
  store
}: AddFileToPadProps) => {
  try {
    const metadata = await getMediaMetadata(file);
    const isVideo = isVideoMetadata(metadata);
    const mediaType = isVideo ? 'video' : 'image';
    log.info(`${mediaType} metadata for pad ${padId}:`, metadata);

    if (!store) {
      log.warn('Store not found');
      return null;
    }

    if (isVideo) {
      // log.info(`Video duration: ${metadata.duration.toFixed(2)} seconds`);

      try {
        log.debug('extracting video thumbnail');
        // const thumbnail = await extractVideoThumbnail(ffmpeg, file);
        const thumbnail = await extractVideoThumbnailCanvas(
          file,
          metadata as MediaVideo
        );

        log.debug('saving video data');
        await dbSaveVideoData({
          file,
          metadata: metadata as MediaVideo,
          thumbnail
        });

        await dbSetPadThumbnail(padId, thumbnail);

        // Update the store with the tile's video ID
        store.send({
          type: 'setPadMedia',
          padId,
          media: metadata
        });
      } catch (error) {
        log.error('Failed to generate video thumbnail:', error);
      }
    } else {
      // Generate thumbnail for images
      try {
        const thumbnail = await createImageThumbnail(file);
        log.info(`Generated thumbnail for image at pad ${padId}`);

        // Save image data to IndexedDB
        await dbSaveImageData(file, metadata as MediaImage, thumbnail);

        // Update the store with the tile's image ID
        store.send({
          type: 'setPadMedia',
          padId,
          media: metadata
        });
      } catch (error) {
        log.error('Failed to generate thumbnail:', error);
      }
    }

    return metadata;
  } catch (error) {
    log.error('Failed to read media metadata:', error);
    return null;
  }
};

const deletePadMedia = async (store: StoreType, pad: Pad) => {
  const sourceUrl = getPadSourceUrl(pad);

  // nothing to clear
  if (!sourceUrl) {
    // log.warn('[deletePadMedia] No source URL found:', pad.id);
    return false;
  }

  const pads = getPadsBySourceUrl(store, sourceUrl);

  // if there is only one pad using this source, then its
  // safe to delete the source data
  if (pads.length === 1) {
    log.debug('[deletePadMedia] Deleting source data:', sourceUrl);
    await dbDeleteMediaData(sourceUrl);
  }

  await dbDeletePadThumbnail(pad.id);

  return true;
};
