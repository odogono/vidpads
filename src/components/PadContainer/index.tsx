import { Suspense } from 'react';

import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { usePads } from '@model/store/selectors';
import { PadComponent } from '../PadComponent';
import { PadLoadingComponent } from '../PadComponent/Loading';
import { SelectSourceModal } from './SelectSourceModal';
import { useHelpers } from './helpers';

export const PadContainer = () => {
  const { pads } = usePads();
  const { ACCEPTED_FILE_TYPES } = usePadDnD();

  const {
    fileInputRef,
    isModalOpen,
    setIsModalOpen,
    handleFileSelect,
    handlePadTouch,
    handleFileButtonClick,
    handleUrlSelect
  } = useHelpers();

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
