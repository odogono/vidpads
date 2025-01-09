import { useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { usePadOperations } from '@model';

const log = createLog('usePadEvents');

export const useFileSelector = () => {
  const { addFileToPad } = usePadOperations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState<string | null>(null);
  const { ACCEPTED_FILE_TYPES } = usePadDnD();

  const handleEmptyPadTouch = (padId: string) => {
    // open file input
    setActiveIndex(padId);
    fileInputRef.current?.click();
    return;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && activeIndex !== null) {
      const file = files[0];
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        log.warn('Invalid file type. Please use PNG, JPEG, or MP4 files.');
        return;
      }
      await addFileToPad({ file, padId: activeIndex });
    }
    e.target.value = '';
  };

  return {
    fileInputRef,
    handleEmptyPadTouch,
    handleFileSelect
  };
};
