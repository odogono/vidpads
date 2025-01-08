import { Suspense } from 'react';

import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { usePads } from '@model/store/selectors';
import { PadComponent } from '../PadComponent';
import { PadLoadingComponent } from '../PadComponent/Loading';
import { useFileSelector } from './useFileSelector';

export const TileContainer = () => {
  const { pads } = usePads();
  const { ACCEPTED_FILE_TYPES } = usePadDnD();
  const { fileInputRef, handleEmptyPadTouch, handleFileSelect } =
    useFileSelector();

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
            <PadComponent pad={pad} onEmptyPadTouch={handleEmptyPadTouch} />
          </Suspense>
        ))}
      </div>
    </div>
  );
};
