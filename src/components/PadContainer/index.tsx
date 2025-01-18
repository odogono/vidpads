import { Suspense, useCallback, useRef } from 'react';

import { CommonModalRef } from '@components/modals/CommonModal';
import { SelectSourceModal } from '@components/modals/SelectSourceModal';
import { usePads } from '@model/hooks/usePads';
import { PadComponent } from '../PadComponent';
import { PadLoadingComponent } from '../PadComponent/Loading';

export const PadContainer = () => {
  const { pads } = usePads();

  const modalRef = useRef<CommonModalRef | null>(null);

  const handlePadTouch = useCallback(
    (padId: string) => {
      modalRef.current?.onOpen({ padId });
    },
    [modalRef]
  );

  return (
    <div id='pad-container' className='flex mt-4 w-full flex-grow bg-slate-500'>
      <div className='grid grid-cols-4 landscape:grid-cols-8 gap-4 p-8 w-full h-full'>
        {pads.map((pad) => (
          <div key={pad.id} className='w-full h-full min-h-[4vh]'>
            <Suspense key={pad.id} fallback={<PadLoadingComponent />}>
              <PadComponent pad={pad} onEmptyPadTouch={handlePadTouch} />
            </Suspense>
          </div>
        ))}
      </div>

      <SelectSourceModal ref={modalRef} />
    </div>
  );
};
