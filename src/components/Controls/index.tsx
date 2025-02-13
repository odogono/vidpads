'use client';

import { Suspense, useRef } from 'react';

import { Indicator } from '@components/Indicator';
import { CommonModalRef } from '@components/modals/CommonModal';
import { DeleteModal } from '@components/modals/DeleteModal';
import { ControlPanes } from '@types';
import { OpBiButton } from '../common/OpBiButton';
import { IntervalPane } from './IntervalPane';
import { SequencerPane } from './SequencerPane';
import { StatePane } from './StatePane';
import { useControlPane } from './hooks/useControlPane';

interface ContainerProps {
  children?: React.ReactNode;
  onPressUp?: () => void;
  onPressDown?: () => void;
  selectedControlPane?: ControlPanes;
}

export const Controls = () => {
  return (
    <Suspense fallback={<Container />}>
      <ControlsLoaded />
    </Suspense>
  );
};

const ControlsLoaded = () => {
  const { selectedControlPane, goToPreviousControlPane, goToNextControlPane } =
    useControlPane();

  const modalRef = useRef<CommonModalRef | null>(null);
  // used to prevent hydration error
  // since selectedPadId is undefined on the server
  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  // const showDeleteModal = useCallback(() => {
  //   modalRef.current?.open();
  // }, [modalRef]);

  // if (!isMounted) {
  //   return null;
  // }

  return (
    <Container
      onPressUp={goToPreviousControlPane}
      onPressDown={goToNextControlPane}
      selectedControlPane={selectedControlPane}
    >
      {/* <div className='text-sm text-foreground/90 flex'>{selectedPadId}</div> */}

      {selectedControlPane === 'state' && <StatePane />}
      {selectedControlPane === 'interval' && <IntervalPane />}
      {/* {selectedControlPane === 'details' && (
        <DetailsPane showDeleteModal={showDeleteModal} />
      )} */}
      {selectedControlPane === 'sequencer' && <SequencerPane />}

      <DeleteModal ref={modalRef} />
    </Container>
  );
};

const Container = ({
  children,
  onPressUp,
  onPressDown,
  selectedControlPane
}: ContainerProps) => (
  <div className='vo-pane-container mt-2 portrait:md:mt-4 landscape:md:mt-4 bg-c2 rounded-lg flex flex-row'>
    <div className='vo-pane-switcher rounded-lg flex-none flex flex-row'>
      <OpBiButton onPressUp={onPressUp} onPressDown={onPressDown} />
      <div className='vo-pane-switcher-indicator m-2 flex flex-col gap-2 justify-center items-center'>
        <Indicator isActive={selectedControlPane === 'state'} />
        <Indicator isActive={selectedControlPane === 'interval'} />
        <Indicator isActive={selectedControlPane === 'sequencer'} />
      </div>
    </div>
    <div className='overflow-x-auto min-w-0 w-full'>{children}</div>
  </div>
);
