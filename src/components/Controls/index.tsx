'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { ArrowDownUp } from 'lucide-react';

import { DeleteModal, DeleteModalRef } from '@components/modals/DeleteModal';
import { usePad } from '@model/hooks/usePad';
import { Button, Card, CardHeader, cn } from '@nextui-org/react';
import { OpBiButton } from '../buttons/OpBiButton';
import { DetailsPane } from './DetailsPane';
import { IntervalPane } from './IntervalPane';
import { SequencerPane } from './SequencerPane';
import { StatePane } from './StatePane';
import { useControlPane } from './hooks/useControlPane';
import { ControlsLoading } from './loading';

export const ControlsLoaded = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { selectedPadId } = usePad();
  // const [selectedPane, setSelectedPane] = useState<PaneState>('details');

  const { selectedControlPane, goToPreviousControlPane, goToNextControlPane } =
    useControlPane();

  const modalRef = useRef<DeleteModalRef | null>(null);
  // used to prevent hydration error
  // since selectedPadId is undefined on the server
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showDeleteModal = useCallback(() => {
    modalRef.current?.onOpen();
  }, [modalRef]);

  if (!isMounted) {
    return null;
  }

  if (!selectedPadId) {
    return (
      <Card className='mt-4 w-full min-h-[8vh] bg-gray-800'>
        <CardHeader className='flex justify-between items-center'>
          <h3 className='font-semibold text-foreground/90'>No Pad Selected</h3>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className='controls-container mt-4 p-2 bg-slate-500 rounded-lg flex flex-row'>
      <div className='switcher rounded-lg  flex flex-row'>
        <OpBiButton
          label='State'
          onPressUp={goToPreviousControlPane}
          onPressDown={goToNextControlPane}
        ></OpBiButton>
        <div className='switcher-indicator m-2 flex flex-col gap-2 justify-center'>
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

const Indicator = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className='switcher-indicator'>
      <div
        className={cn(
          'aspect-square rounded-full w-[0.5vh] h-[0.5vh] bg-black ',
          isActive && 'bg-red-500'
        )}
      ></div>
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
