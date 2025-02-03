import { extractVideoThumbnail as extractVideoThumbnailCanvas } from '@helpers/canvas';
import { createImageThumbnail } from '@helpers/image';
import { createLog } from '@helpers/log';
import { getMediaMetadata, isVideoMetadata } from '@helpers/metadata';
import {
  getAllMediaMetaData as dbGetAllMediaMetaData,
  saveImageData as dbSaveImageData,
  savePadThumbnail as dbSavePadThumbnail,
  saveVideoData as dbSaveVideoData
} from '@model/db/api';
import { StoreType } from '@model/store/types';
import { MediaImage, MediaVideo } from '@model/types';

const log = createLog('model/api', ['debug']);

export interface AddFileToPadProps {
  file: File;
  padId: string;
  project?: StoreType;
  projectId: string;
}

export interface AddUrlToPadProps {
  url: string;
  padId: string;
  projectId: string;
}

export const getAllMediaMetaData = async () => {
  return dbGetAllMediaMetaData();
};

export interface CopyPadToPadProps {
  sourcePadId: string;
  targetPadId: string;
}

// export const addUrlToPad = async ({
//   url,
//   padId,
//   project
// }: AddUrlToPadProps) => {
//   if (!project) {
//     log.warn('Project not found');
//     return null;
//   }

//   // determine the type of url
//   const media = await getUrlMetadata(url);

//   if (!media) {
//     log.debug('[addUrlToPad] No metadata found for url:', url);
//     return null;
//   }

//   await dbSaveMediaData(media);

//   log.debug('[addUrlToPad] url:', url, padId);

//   // fetch the thumbnail
//   // const thumbnail = await getYouTubeThumbnail(media as MediaYouTube);

//   // if (!thumbnail) {
//   //   log.warn('[addUrlToPad] No thumbnail found for url:', url);
//   //   return null;
//   // }

//   // await dbSaveUrlData({
//   //   media: media as MediaYouTube,
//   //   thumbnail
//   // });

//   // log.debug('[addUrlToPad] thumbnail:', media.url, thumbnail);

//   // await dbSavePadThumbnail(projectId, padId, thumbnail);

//   // Update the store with the tile's video ID
//   project.send({
//     type: 'setPadMedia',
//     padId,
//     media
//   });

//   return media;
// };

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
  project,
  projectId
}: AddFileToPadProps) => {
  try {
    const media = await getMediaMetadata(file);
    const isVideo = isVideoMetadata(media);
    const mediaType = isVideo ? 'video' : 'image';
    log.info(`${mediaType} metadata for pad ${padId}:`, media);

    if (!project) {
      log.warn('Project not found');
      return null;
    }

    if (isVideo) {
      // log.info(`Video duration: ${metadata.duration.toFixed(2)} seconds`);

      try {
        log.debug('extracting video thumbnail');
        // const thumbnail = await extractVideoThumbnail(ffmpeg, file);
        const thumbnail = await extractVideoThumbnailCanvas(
          file,
          media as MediaVideo
        );

        log.debug('saving video data');
        await dbSaveVideoData({
          file,
          media: media as MediaVideo,
          thumbnail
        });

        await dbSavePadThumbnail(projectId, padId, thumbnail);

        // Update the store with the tile's video ID
        project.send({
          type: 'setPadMedia',
          padId,
          media
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
        await dbSaveImageData(file, media as MediaImage, thumbnail);

        // Update the store with the tile's image ID
        project.send({
          type: 'setPadMedia',
          padId,
          media
        });
      } catch (error) {
        log.error('Failed to generate thumbnail:', error);
      }
    }

    return media;
  } catch (error) {
    log.debug('[addFileToPad] Failed to read media metadata:', error);
    return null;
  }
};
