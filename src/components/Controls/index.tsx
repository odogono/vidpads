'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { Indicator } from '@components/Indicator';
import { CommonModalRef } from '@components/modals/CommonModal';
import { DeleteModal } from '@components/modals/DeleteModal';
import { OpBiButton } from '../buttons/OpBiButton';
import { DetailsPane } from './DetailsPane';
import { IntervalPane } from './IntervalPane';
import { SequencerPane } from './SequencerPane';
import { StatePane } from './StatePane';
import { useControlPane } from './hooks/useControlPane';
import { ControlsLoading } from './loading';

export const ControlsLoaded = () => {
  const [isMounted, setIsMounted] = useState(false);
  // const { selectedPadId } = usePad();
  // const [selectedPane, setSelectedPane] = useState<PaneState>('details');

  const { selectedControlPane, goToPreviousControlPane, goToNextControlPane } =
    useControlPane();

  const modalRef = useRef<CommonModalRef | null>(null);
  // used to prevent hydration error
  // since selectedPadId is undefined on the server
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showDeleteModal = useCallback(() => {
    modalRef.current?.open();
  }, [modalRef]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className='controls-container mt-4 p-2 bg-c2 rounded-lg flex flex-row'>
      <div className='switcher rounded-lg  flex flex-row'>
        <OpBiButton
          onPressUp={goToPreviousControlPane}
          onPressDown={goToNextControlPane}
        ></OpBiButton>
        <div className='switcher-indicator m-2 flex flex-col gap-2 justify-center items-center '>
          <Indicator isActive={selectedControlPane === 'state'} />
          <Indicator isActive={selectedControlPane === 'interval'} />
          <Indicator isActive={selectedControlPane === 'details'} />
          <Indicator isActive={selectedControlPane === 'sequencer'} />
        </div>
      </div>
      {/* <div className='text-sm text-foreground/90 flex'>{selectedPadId}</div> */}

      {selectedControlPane === 'state' && <StatePane />}
      {selectedControlPane === 'interval' && <IntervalPane />}
      {selectedControlPane === 'details' && (
        <DetailsPane showDeleteModal={showDeleteModal} />
      )}
      {selectedControlPane === 'sequencer' && <SequencerPane />}

      <DeleteModal ref={modalRef} />
    </div>
  );
};

export const Controls = () => {
  return (
    <Suspense fallback={<ControlsLoading />}>
      <ControlsLoaded />
    </Suspense>
  );
};
