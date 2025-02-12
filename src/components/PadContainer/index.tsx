import { Suspense, useCallback, useRef } from 'react';

import { CommonModalRef } from '@components/modals/CommonModal';
import { SelectSourceModal } from '@components/modals/SelectSourceModal';
import { createLog } from '@helpers/log';
import { PadComponent } from '../PadComponent';
import { PadLoadingComponent } from '../PadComponent/Loading';
import { usePadContainerEvents } from './usePadContainerEvents';

const log = createLog('PadContainer', ['debug']);

export const PadContainer = () => {
  const modalRef = useRef<CommonModalRef | null>(null);

  const {
    projectId,
    pads,
    padToMidiMap,
    arePlayersEnabled,
    isPadPlayEnabled,
    isPadSelectSourceDisabled,
    isMidiMappingModeEnabled,
    removeMidiMappingForPad
  } = usePadContainerEvents();

  const handlePadTouch = useCallback(
    (padId: string) => {
      modalRef.current?.open({ padId });
    },
    [modalRef]
  );

  log.debug('render', {
    arePlayersEnabled,
    isPadPlayEnabled,
    isPadSelectSourceDisabled
  });

  return (
    <div className='vo-pad-container flex mt-2 portrait:md:mt-4 landscape:md:mt-4 w-full flex-grow rounded-lg'>
      <div className='grid grid-cols-4 landscape:grid-cols-8 gap-2 w-full h-full'>
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
                midiNote={padToMidiMap[pad.id]?.note ?? '-'}
                onEmptyPadTouch={handlePadTouch}
                onRemoveMidiMapping={removeMidiMappingForPad}
                isPlayEnabled={arePlayersEnabled}
                isSelectSourceEnabled={!isPadSelectSourceDisabled}
                isMidiMappingModeEnabled={isMidiMappingModeEnabled}
              />
            </Suspense>
          </div>
        ))}
      </div>

      <SelectSourceModal ref={modalRef} />
    </div>
  );
};
