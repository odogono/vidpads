'use client';

import { useRef, useState } from 'react';

import { usePadOperations } from '@model';
import { useFileSelector } from './useFileSelector';

export const useHelpers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const touchedPadIdRef = useRef<string | null>(null);
  const { addUrlToPad } = usePadOperations();
  const { fileInputRef, handleEmptyPadTouch, handleFileSelect } =
    useFileSelector();

  const handlePadTouch = (padId: string) => {
    touchedPadIdRef.current = padId;
    setIsModalOpen(true);
  };

  const handleUrlSelect = async (url: string) => {
    // TODO: Implement URL input handling
    await addUrlToPad({ url, padId: touchedPadIdRef.current });
    setIsModalOpen(false);
  };

  const handleFileButtonClick = () => {
    setIsModalOpen(false);
    if (touchedPadIdRef.current) {
      handleEmptyPadTouch(touchedPadIdRef.current);
    }
  };

  return {
    fileInputRef,
    isModalOpen,
    setIsModalOpen,
    handleFileSelect,
    handlePadTouch,
    handleUrlSelect,
    handleFileButtonClick
  };
};
