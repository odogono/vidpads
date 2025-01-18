import { Suspense } from 'react';

import { SelectSourceModal } from '@components/modals/SelectSourceModal';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { usePads } from '@model/hooks/usePads';
import { PadComponent } from '../PadComponent';
import { PadLoadingComponent } from '../PadComponent/Loading';
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
    <div id='pad-container' className='flex mt-4 w-full flex-grow bg-slate-500'>
      <input
        type='file'
        ref={fileInputRef}
        className='hidden'
        accept={ACCEPTED_FILE_TYPES.join(',')}
        onChange={handleFileSelect}
      />
      <div className='grid grid-cols-4 landscape:grid-cols-8 gap-4 p-8 w-full h-full'>
        {/* {pads.map((pad) => (
          <Suspense key={pad.id} fallback={<PadLoadingComponent />}>
            <PadComponent pad={pad} onEmptyPadTouch={handlePadTouch} />
          </Suspense>
        ))} */}

        {pads.map((pad) => (
          <div key={pad.id} className='w-full h-full min-h-[4vh]'>
            <Suspense key={pad.id} fallback={<PadLoadingComponent />}>
              <PadComponent pad={pad} onEmptyPadTouch={handlePadTouch} />
            </Suspense>
          </div>
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
