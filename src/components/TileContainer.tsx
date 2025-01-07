import React, { Suspense, useRef, useState } from 'react';

import {
  extractVideoThumbnail,
  extractVideoThumbnail as extractVideoThumbnailCanvas
} from '@helpers/canvas';
import { useFFmpeg } from '@helpers/ffmpeg/useFFmpeg';
import { createImageThumbnail } from '@helpers/image';
import { createLog } from '@helpers/log';
import { getMediaMetadata, isVideoMetadata } from '@helpers/metadata';
import { extractVideoThumbnail as extractVideoThumbnailWebcodecs } from '@helpers/webcodecs';
import { saveImageData, saveVideoData } from '@model/db/api';
import { usePads } from '@model/store/selectors';
import { MediaImage, MediaVideo } from '@model/types';
import { PadComponent } from './PadComponent';
import { PadLoadingComponent } from './PadLoadingComponent';

const log = createLog('TileContainer');

const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'video/mp4'
];

export const TileContainer = () => {
  const { ffmpeg } = useFFmpeg();
  const { pads, store } = usePads();

  const [dragOverIndex, setDragOverIndex] = useState<string | null>(null);

  // Create a ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, padId: string) => {
    e.preventDefault();
    // Only show drop indicator if the dragged file is valid
    const types = Array.from(e.dataTransfer.items).map((item) => item.type);
    if (types.some((type) => ACCEPTED_FILE_TYPES.includes(type))) {
      setDragOverIndex(padId);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const processMediaFile = async (file: File, padId: string) => {
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

  const handleDrop = async (e: React.DragEvent, padId: string) => {
    e.preventDefault();
    setDragOverIndex(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        log.warn('Invalid file type. Please use PNG, JPEG, or MP4 files.');
        return;
      }
      await processMediaFile(file, padId);
      log.info(`Processed file ${file.name} for pad ${padId}`);
    }
  };

  const handleClick = (padId: string, hasMedia: boolean) => {
    if (!hasMedia) {
      setActiveIndex(padId);
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && activeIndex !== null) {
      const file = files[0];
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        log.warn('Invalid file type. Please use PNG, JPEG, or MP4 files.');
        return;
      }
      await processMediaFile(file, activeIndex);
    }
    e.target.value = '';
  };

  return (
    <div className='mt-4 w-[800px] mx-auto'>
      <input
        type='file'
        ref={fileInputRef}
        className='hidden'
        accept={ACCEPTED_FILE_TYPES.join(',')}
        onChange={handleFileSelect}
      />
      <div className='grid grid-cols-4 gap-8'>
        {pads.map((pad) => (
          <Suspense key={pad.id} fallback={<PadLoadingComponent />}>
            <PadComponent
              pad={pad}
              isDraggedOver={dragOverIndex === pad.id}
              onTap={handleClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          </Suspense>
        ))}
      </div>
    </div>
  );
};
