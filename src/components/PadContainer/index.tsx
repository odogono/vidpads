import { Suspense, useCallback, useRef } from 'react';

import { CommonModalRef } from '@components/modals/CommonModal';
import { SelectSourceModal } from '@components/modals/SelectSourceModal';
import { createLog } from '../../helpers/log';
import { PadComponent } from '../PadComponent';
import { PadLoadingComponent } from '../PadComponent/Loading';
import { usePadContainerEvents } from './usePadContainerEvents';

const log = createLog('PadContainer', ['debug']);

export const PadContainer = () => {
  const modalRef = useRef<CommonModalRef | null>(null);

  const {
    projectId,
    pads,
    padsWithMediaStr,
    isPadSelectSourceEnabled,
    isPadPlayEnabled
  } = usePadContainerEvents();

  const handlePadTouch = useCallback(
    (padId: string) => {
      modalRef.current?.open({ padId });
    },
    [modalRef]
  );

  log.debug('render', padsWithMediaStr, pads);

  return (
    <div className='vo-pad-container flex mt-4 w-full flex-grow bg-slate-500 rounded-lg'>
      <div className='grid grid-cols-4 landscape:grid-cols-8 gap-4 p-8 w-full h-full'>
        {pads.map((pad) => (
          <div
            key={`${projectId}-${pad.id}`}
            className='w-full h-full min-h-[4vh]'
          >
            <Suspense
              key={`s-${projectId}-${pad.id}`}
              fallback={<PadLoadingComponent />}
            >
              <PadComponent
                pad={pad}
                onEmptyPadTouch={handlePadTouch}
                isPlayEnabled={isPadPlayEnabled}
                isSelectSourceEnabled={isPadSelectSourceEnabled}
              />
            </Suspense>
          </div>
        ))}
      </div>

      <SelectSourceModal ref={modalRef} />
    </div>
  );
};
