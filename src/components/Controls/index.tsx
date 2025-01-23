'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { ArrowDownUp } from 'lucide-react';

import { DeleteModal, DeleteModalRef } from '@components/modals/DeleteModal';
import { usePad } from '@model/hooks/usePad';
import { Button, Card, CardHeader, cn } from '@nextui-org/react';
import { IntervalPane } from './IntervalPane';
import { StatePane } from './StatePane';
import { ControlsLoading } from './loading';

// Add this type definition at the top of the file, after the imports
type PaneState = 'state' | 'interval' | 'tempo' | 'settings';

export const ControlsLoaded = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { selectedPadId } = usePad();
  const [selectedPane, setSelectedPane] = useState<PaneState>('interval');

  const modalRef = useRef<DeleteModalRef | null>(null);
  // used to prevent hydration error
  // since selectedPadId is undefined on the server
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showDeleteModal = useCallback(() => {
    modalRef.current?.onOpen();
  }, [modalRef]);

  const cycleToNextState = useCallback(() => {
    setSelectedPane((currentState) => {
      switch (currentState) {
        case 'state':
          return 'interval';
        case 'interval':
          return 'state';
        case 'tempo':
          return 'settings';
        case 'settings':
          return 'state';
        default:
          return 'state';
      }
    });
  }, []);

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
    <>
      <div className='controls-container mt-4 p-2 bg-slate-500 rounded-lg flex flex-row gap-4'>
        <div className='switcher rounded-lg p-1  flex flex-row'>
          <Button
            isIconOnly
            aria-label='State'
            onPress={cycleToNextState}
            className={cn(
              'w-full h-full aspect-square bg-slate-400 hover:bg-slate-300 text-black'
            )}
          >
            <ArrowDownUp />
          </Button>
          <div className='switcher-indicator m-4 flex flex-col gap-2'>
            <Indicator isActive={selectedPane === 'state'} />
            <Indicator isActive={selectedPane === 'interval'} />
            <Indicator isActive={selectedPane === 'tempo'} />
            <Indicator isActive={selectedPane === 'settings'} />
          </div>
        </div>

        {selectedPane === 'state' && (
          <StatePane showDeleteModal={showDeleteModal} />
        )}
        {selectedPane === 'interval' && <IntervalPane />}
        {/* {selectedPane === 'tempo' && <TempoPane />}
        {selectedPane === 'settings' && <SettingsPane />} */}

        <DeleteModal ref={modalRef} />
      </div>
    </>
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
