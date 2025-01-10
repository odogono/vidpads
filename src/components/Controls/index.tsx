import { useCallback, useEffect, useRef } from 'react';

import { createLog } from '@helpers/log';
import { useEditActive, usePad } from '@model/store/selectors';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Slider
} from '@nextui-org/react';
import { getPadStartAndEndTime } from '../../model/pad';
import { DeleteModal, DeleteModalRef } from './DeleteModal';
import { StartEndSlider } from './StartEndSlider';

const log = createLog('Controls');

export const Controls = () => {
  const {
    isLooped,
    isPadOneShot,
    pad,
    setPadIsLooped,
    setPadIsOneShot,
    selectedPadId
  } = usePad();
  const { isEditActive, setEditActive } = useEditActive();
  const modalRef = useRef<DeleteModalRef>(null);

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

  return (
    <Card className='mt-4 w-[800px] h-[130px] mx-auto bg-gray-800'>
      <CardHeader className='flex justify-between items-center'>
        <h3 className='font-semibold text-foreground/90'>
          Controls {selectedPadId}
        </h3>
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
