import React, { useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { getMediaMetadata, isVideoMetadata } from '@helpers/metadata';
import { useStore } from '@model/store/useStore';

const log = createLog('TileContainer');

const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'video/mp4'
];

export const TileContainer = () => {
  const store = useStore();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Create a ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    // Only show drop indicator if the dragged file is valid
    const types = Array.from(e.dataTransfer.items).map((item) => item.type);
    if (types.some((type) => ACCEPTED_FILE_TYPES.includes(type))) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const processMediaFile = async (file: File, index: number) => {
    try {
      const metadata = await getMediaMetadata(file);
      const mediaType = isVideoMetadata(metadata) ? 'video' : 'image';
      log.info(`${mediaType} metadata for tile ${index}:`, metadata);

      if (isVideoMetadata(metadata)) {
        log.info(`Video duration: ${metadata.duration.toFixed(2)} seconds`);
      }

      store.send({
        type: 'updatePadSource',
        padId: `a${index + 1}`,
        url: file.name
      });

      return metadata;
    } catch (error) {
      log.error('Failed to read media metadata:', error);
      return null;
    }
  };

  const handleDrop = async (e: React.DragEvent, tileIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        log.warn('Invalid file type. Please use PNG, JPEG, or MP4 files.');
        return;
      }
      await processMediaFile(file, tileIndex);
      log.info(`Processed file ${file.name} for tile ${tileIndex}`);
    }
  };

  const handleClick = (index: number) => {
    setActiveIndex(index);
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
        {Array.from({ length: 16 }).map((_, index) => (
          <div
            key={index}
            className={`
              aspect-square rounded-lg cursor-pointer transition-all
              ${
                dragOverIndex === index
                  ? 'bg-gray-600 scale-105'
                  : 'bg-gray-800 hover:bg-gray-700'
              }
            `}
            onClick={() => handleClick(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          />
        ))}
      </div>
    </div>
  );
};
