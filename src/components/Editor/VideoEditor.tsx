import { useCallback, useEffect } from 'react';

import { createLog } from '@helpers/log';
import { useEditActive, useSelectedPad } from '@model/store/selectors';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Image,
  Link
} from '@nextui-org/react';

const log = createLog('VideoEditor');

export const VideoEditor = () => {
  const { isEditActive } = useEditActive();
  const { isPadOneShot, pad, setPadIsOneShot } = useSelectedPad();

  const handleOneShot = useCallback(() => {
    log.debug('handleOneShot', pad);
    if (!pad) return;
    setPadIsOneShot(pad.id, !isPadOneShot);
  }, [pad, isPadOneShot, setPadIsOneShot]);

  useEffect(() => {
    if (!pad) return;
    log.debug('selectedPadId', pad);
  }, [pad]);

  if (!isEditActive) return null;

  return (
    <Card className='absolute top-0 left-0 h-full w-full bg-gray-800 z-50'>
      <CardBody>
        <p>Video Editor {pad?.id}</p>
      </CardBody>
      <CardFooter>
        <Button
          className={
            pad?.isOneShot
              ? 'bg-primary border-default-200'
              : 'text-foreground border-default-200'
          }
          onPress={handleOneShot}
          color='primary'
          variant={pad?.isOneShot ? 'solid' : 'flat'}
          radius='full'
        >
          One Shot
        </Button>
      </CardFooter>
    </Card>
  );
};
