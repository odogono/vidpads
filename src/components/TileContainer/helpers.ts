import { FFmpeg } from '@ffmpeg/ffmpeg';
import {
  extractVideoThumbnail,
  extractVideoThumbnail as extractVideoThumbnailCanvas
} from '@helpers/canvas';
import { createImageThumbnail } from '@helpers/image';
import { createLog } from '@helpers/log';
import { getMediaMetadata, isVideoMetadata } from '@helpers/metadata';
import { saveVideoData } from '@model/db/api';
import { StoreType } from '@model/store/types';
import { MediaImage, MediaVideo } from '@model/types';
import { saveImageData } from '../../model/db/api';

const log = createLog('TileContainer/helpers');

export interface ProcessMediaFileProps {
  file: File;
  padId: string;
  store: StoreType;
  ffmpeg?: FFmpeg | null;
}

export const processMediaFile = async ({
  file,
  padId,
  store
}: ProcessMediaFileProps) => {
  try {
    const metadata = await getMediaMetadata(file);
    const isVideo = isVideoMetadata(metadata);
    const mediaType = isVideo ? 'video' : 'image';
    log.info(`${mediaType} metadata for pad ${padId}:`, metadata);

    if (isVideo) {
      log.info(`Video duration: ${metadata.duration.toFixed(2)} seconds`);

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
