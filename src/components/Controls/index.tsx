'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useTooltip } from '@components/Tooltip/useTooltip';
import { DeleteModal, DeleteModalRef } from '@components/modals/DeleteModal';
import { useEditActive } from '@model/hooks/useEditActive';
import { usePad } from '@model/hooks/usePad';
import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { VolumeDial } from './Dial/VolumeDial';
import { IntervalSlider } from './IntervalSlider';
import { NumericInterval } from './NumericInterval';
import { PadStateButton } from './PadStateButton';
import { Tooltip, TooltipProps } from './Tooltip';
import { ControlsLoading } from './loading';

export const ControlsLoaded = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [toolTipProps, setToolTipProps] = useState<TooltipProps>({
    time: 0,
    x: -1
  });
  const {
    isLooped,
    isPadOneShot,
    pad,
    setPadIsLooped,
    setPadIsOneShot,
    selectedPadId,
    setPadVolume
  } = usePad();
  const { isEditActive, setEditActive } = useEditActive();
  const modalRef = useRef<DeleteModalRef | null>(null);
  // const { setToolTip, hideToolTip } = useTooltip();
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
    <>
      <Card className='mt-4 min-h-[8vh] bg-slate-500 rounded-lg'>
        <CardHeader className='flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <h3 className='font-semibold text-foreground/90'>
              {selectedPadId}
            </h3>
          </div>
          <div className='flex gap-2'>
            <VolumeDial pad={pad} setPadVolume={setPadVolume} />
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
              label='Numeric'
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
          {isEditActive ? (
            <NumericInterval pad={pad} />
          ) : (
            <IntervalSlider pad={pad} />
          )}
        </CardBody>
        <DeleteModal ref={modalRef} />
      </Card>
    </>
  );
};

export const Controls = () => {
  return (
    <Suspense fallback={<ControlsLoading />}>
      <ControlsLoaded />
    </Suspense>
  );
};
