import { useEffect, useRef, useState } from 'react';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { createLog } from '@helpers/log';
import { addFileToPad, copyPadToPad } from '@model';
import { StoreType } from '@model/store/types';
import { useDragContext } from '../DragContext';

const log = createLog('usePadEvents');

const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'video/mp4'
];

export interface UsePadEventsProps {
  ffmpeg: FFmpeg | null;
  store: StoreType;
}

export const usePadEvents = ({ ffmpeg, store }: UsePadEventsProps) => {
  const [dragOverIndex, setDragOverIndex] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState<string | null>(null);
  const { draggingPadId, setDraggingPadId } = useDragContext();

  // Clear dragging state when drag ends
  // useEffect(() => {
  //   const handleDragEnd = () => {
  //     setDraggingPadId(null);
  //   };

  //   document.addEventListener('dragend', handleDragEnd);
  //   return () => document.removeEventListener('dragend', handleDragEnd);
  // }, []);

  const handlePadDragStart = (padId: string) => {
    setDraggingPadId(padId);
    log.debug('handlePadDragStart', padId);
  };

  const handlePadDragEnd = () => {
    setDraggingPadId(null);
    log.debug('handlePadDragEnd');
  };

  const handleDragOver = (e: React.DragEvent, padId: string) => {
    e.preventDefault();

    // Check if this is a pad being dragged
    const isPadDrag = e.dataTransfer.types.includes('application/pad-id');

    if (isPadDrag) {
      // Only show drop indicator if dragging onto a different pad
      if (draggingPadId !== padId) {
        setDragOverIndex(padId);
      }
      return;
    }

    // Handle file drag (existing code)
    const types = Array.from(e.dataTransfer.items).map((item) => item.type);
    if (types.some((type) => ACCEPTED_FILE_TYPES.includes(type))) {
      setDragOverIndex(padId);
    }

    log.debug('handleDragOver', padId, types);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, targetPadId: string) => {
    e.preventDefault();
    setDragOverIndex(null);

    // Check if this is a pad being dropped
    const sourcePadId = e.dataTransfer.getData('application/pad-id');
    const text = e.dataTransfer.getData('text/plain');

    log.debug('handleDrop', sourcePadId, targetPadId, text);

    if (sourcePadId) {
      if (sourcePadId !== targetPadId) {
        await copyPadToPad(store, sourcePadId, targetPadId);
      }
      return;
    }

    // Handle file drop (existing code)
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        log.warn('Invalid file type. Please use PNG, JPEG, or MP4 files.');
        return;
      }
      await addFileToPad({ file, padId: targetPadId, store, ffmpeg });
      log.info(`Processed file ${file.name} for pad ${targetPadId}`);
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
      await addFileToPad({ file, padId: activeIndex, store, ffmpeg });
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
    handlePadDragStart,
    handlePadDragEnd,
    ACCEPTED_FILE_TYPES
  };
};
