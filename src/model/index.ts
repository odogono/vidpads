import { useEffect } from 'react';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { extractVideoThumbnail as extractVideoThumbnailCanvas } from '@helpers/canvas';
import { createImageThumbnail } from '@helpers/image';
import { createLog } from '@helpers/log';
import { getMediaMetadata, isVideoMetadata } from '@helpers/metadata';
import {
  getAllMediaMetaData as dbGetAllMediaMetaData,
  getMediaData as dbGetMediaData,
  deleteMediaData,
  saveImageData,
  saveVideoData
} from '@model/db/api';
import { getPadById, getPadsBySourceUrl } from '@model/store/selectors';
import { StoreType } from '@model/store/types';
import { MediaImage, MediaVideo, Pad } from '@model/types';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { getPadSourceUrl } from './pad';

const log = createLog('model/api');

export interface AddFileToPadProps {
  file: File;
  padId: string;
  store: StoreType;
  ffmpeg?: FFmpeg | null;
}

export const getAllMediaMetaData = async () => {
  return dbGetAllMediaMetaData();
};

export const useMetadataFromPad = (pad?: Pad) => {
  const queryClient = useQueryClient();

  // Invalidate the cache when pad changes
  // TODO: not sure about this yet
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

      return media;
    }
  });
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

    if (isVideo) {
      // log.info(`Video duration: ${metadata.duration.toFixed(2)} seconds`);

      try {
        log.debug('extracting video thumbnail');
        // const thumbnail = await extractVideoThumbnail(ffmpeg, file);
        const thumbnail = await extractVideoThumbnailCanvas(
          file,
          metadata as MediaVideo
        );
        // const thumbnail = await extractVideoThumbnailCanvas( file );

        log.debug('saving video data');
        await saveVideoData({
          file,
          metadata: metadata as MediaVideo,
          thumbnail
        });

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
        await saveImageData(file, metadata as MediaImage, thumbnail);

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

export const copyPadToPad = async (
  store: StoreType,
  sourcePadId: string,
  targetPadId: string
) => {
  const targetPad = getPadById(store, targetPadId);
  if (!targetPad) {
    log.warn('[copyPad] Pad not found:', targetPadId);
    return false;
  }

  // clear the target pad
  await deletePadMedia(store, targetPad);

  store.send({
    type: 'copyPad',
    sourcePadId,
    targetPadId
  });

  return true;
};

/**
 * Clears the pad and deletes the source data if it is the only pad using it
 *
 * @param store
 * @param padId
 * @returns
 */
export const clearPad = async (
  store: StoreType,
  padId: string
): Promise<boolean> => {
  // retrieve the pad data
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

  return true;
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
    await deleteMediaData(sourceUrl);
  }

  return true;
};

export interface ApplyPadTrimOperationProps {
  store: StoreType;
  pad: Pad;
  start: number;
  end: number;
  thumbnail?: string;
}

export const applyPadTrimOperation = ({
  store,
  pad,
  start,
  end,
  thumbnail
}: ApplyPadTrimOperationProps) => {
  store.send({
    type: 'applyTrimToPad',
    padId: pad.id,
    start,
    end
  });
  // const newPad = applyPadTrimOperation(pad, start, end);
  // const newPad = applyPadTrimOperation(pad, start, end);
  // return newPad;

  log.debug(
    '[applyPadTrimOperation] pad:',
    pad.id,
    'start:',
    start,
    'end:',
    end
  );

  return pad;
};
