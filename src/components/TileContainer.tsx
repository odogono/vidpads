import React, { Suspense, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { getMediaMetadata, isVideoMetadata } from '@helpers/metadata';
import { saveImageData } from '@model/db/api';
import { usePads } from '@model/store/selectors';
import { MediaImage } from '@model/types';
import { PadComponent } from './PadComponent';
import { PadLoadingComponent } from './PadLoadingComponent';

const log = createLog('TileContainer');

const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'video/mp4'
];

const createImageThumbnail = (
  file: File,
  size: number = 384
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate the dimensions to maintain aspect ratio while filling a square
      const scale = Math.max(size / img.width, size / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (size - scaledWidth) / 2;
      const offsetY = (size - scaledHeight) / 2;

      // Set canvas size to desired thumbnail size
      canvas.width = size;
      canvas.height = size;

      // Fill with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, size, size);

      // Draw image centered and scaled
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const TileContainer = () => {
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
        // Handle video saving separately
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

  const handleClick = (padId: string) => {
    setActiveIndex(padId);
    fileInputRef.current?.click();
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
