'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { DeleteModal, DeleteModalRef } from '@components/modals/DeleteModal';
import { useEditActive, usePad } from '@model/store/selectors';
import { Button, Card, CardBody, CardHeader } from '@nextui-org/react';
import { StartEndSlider } from './StartEndSlider';
import { ControlsLoading } from './loading';

export const ControlsLoaded = () => {
  const [isMounted, setIsMounted] = useState(false);
  const {
    isLooped,
    isPadOneShot,
    pad,
    setPadIsLooped,
    setPadIsOneShot,
    selectedPadId
  } = usePad();
  const { isEditActive, setEditActive } = useEditActive();
  const modalRef = useRef<DeleteModalRef | null>(null);

  // used to prevent hydration error
  // since selectedPadId is undefined on the server
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEdit = useCallback(() => {
    setEditActive(!isEditActive);
  }, [isEditActive, setEditActive]);

  const handleOneShot = useCallback(() => {
    if (!pad) return;
    setPadIsOneShot(pad.id, !isPadOneShot);
  }, [pad, isPadOneShot, setPadIsOneShot]);

  const handleLooped = useCallback(() => {
    if (!pad) return;
    setPadIsLooped(pad.id, !isLooped);
  }, [pad, isLooped, setPadIsLooped]);

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
    <Card className='mt-4 min-h-[8vh] bg-gray-800'>
      <CardHeader className='flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <h3 className='font-semibold text-foreground/90'>{selectedPadId}</h3>
        </div>
        <div className='flex gap-2'>
          <PadStateButton
            label='One Shot'
            onPress={handleOneShot}
            isActive={pad?.isOneShot ?? false}
          />
          <PadStateButton
            label='Loop'
            onPress={handleLooped}
            isActive={pad?.isLooped ?? false}
          />
          <PadStateButton
            label='Edit'
            onPress={handleEdit}
            isActive={isEditActive ?? false}
          />
          <PadStateButton
            label='Delete'
            onPress={() => modalRef.current?.onOpen()}
            isActive={selectedPadId !== undefined}
          />
        </div>
      </CardHeader>
      <CardBody>
        <StartEndSlider isEditActive={true} pad={pad} />
      </CardBody>
      <DeleteModal ref={modalRef} />
    </Card>
  );
};

export const Controls = () => {
  return (
    <Suspense fallback={<ControlsLoading />}>
      <ControlsLoaded />
    </Suspense>
  );
};

const PadStateButton = ({
  label,
  onPress,
  isActive
}: {
  label: string;
  onPress: () => void;
  isActive: boolean;
}) => {
  return (
    <Button
      className={
        isActive
          ? 'bg-primary border-default-200'
          : 'text-foreground border-default-200'
      }
      onPress={onPress}
      color='primary'
      variant={isActive ? 'solid' : 'flat'}
      radius='full'
    >
      {label}
    </Button>
  );
};
