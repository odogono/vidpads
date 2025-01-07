import { useRef, useState } from 'react';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { createLog } from '@helpers/log';
import { Store } from '@model/store/types';
import { processMediaFile } from './helpers';

const log = createLog('usePadEvents');

const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'video/mp4'
];

export interface UsePadEventsProps {
  ffmpeg: FFmpeg | null;
  store: Store;
}

export const usePadEvents = ({ ffmpeg, store }: UsePadEventsProps) => {
  const [dragOverIndex, setDragOverIndex] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, padId: string) => {
    e.preventDefault();
    const types = Array.from(e.dataTransfer.items).map((item) => item.type);
    if (types.some((type) => ACCEPTED_FILE_TYPES.includes(type))) {
      setDragOverIndex(padId);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
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
      await processMediaFile({ file, padId, store, ffmpeg });
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
      await processMediaFile({ file, padId: activeIndex, store, ffmpeg });
    }
    e.target.value = '';
  };

  return {
    dragOverIndex,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleClick,
    handleFileSelect,
    ACCEPTED_FILE_TYPES
  };
};
