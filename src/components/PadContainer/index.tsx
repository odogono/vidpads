import { Suspense, useRef, useState } from 'react';

import { useKeyboardControls } from '@helpers/keyboard';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { usePads } from '@model/store/selectors';
import { PadComponent } from '../PadComponent';
import { PadLoadingComponent } from '../PadComponent/Loading';
import { SelectSourceModal } from './SelectSourceModal';
import { useFileSelector } from './useFileSelector';

export const PadContainer = () => {
  const { pads } = usePads();
  const { ACCEPTED_FILE_TYPES } = usePadDnD();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fileInputRef, handleEmptyPadTouch, handleFileSelect } =
    useFileSelector();
  const touchedPadIdRef = useRef<string | null>(null);

  useKeyboardControls();

  const handlePadTouch = (padId: string) => {
    touchedPadIdRef.current = padId;
    setIsModalOpen(true);
  };

  const handleUrlSelect = () => {
    // TODO: Implement URL input handling
    setIsModalOpen(false);
  };

  const handleFileButtonClick = () => {
    setIsModalOpen(false);
    if (touchedPadIdRef.current) {
      handleEmptyPadTouch(touchedPadIdRef.current);
    }
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
      <div className='grid grid-cols-4 gap-4'>
        {pads.map((pad) => (
          <Suspense key={pad.id} fallback={<PadLoadingComponent />}>
            <PadComponent pad={pad} onEmptyPadTouch={handlePadTouch} />
          </Suspense>
        ))}
      </div>
      <SelectSourceModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onFileSelect={handleFileButtonClick}
        onUrlSelect={handleUrlSelect}
      />
    </div>
  );
};
