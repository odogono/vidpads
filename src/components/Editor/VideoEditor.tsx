import { useCallback, useEffect, useRef, useState } from 'react';

import { ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Player } from '@components/Player/Player';
import { PlayerRef } from '@components/Player/types';
import { createLog } from '@helpers/log';
import { applyPadTrimOperation, useMetadataFromPad } from '@model';
import { useEditActive, usePad } from '@model/store/selectors';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Image,
  Slider
} from '@nextui-org/react';
import { useStartAndEndTime } from './useStartAndEndTime';

const log = createLog('VideoEditor');

export const VideoEditor = () => {
  const { isEditActive } = useEditActive();
  const { isPadOneShot, pad, setPadIsOneShot, store } = usePad();
  const { data: metadata } = useMetadataFromPad(pad);
  const videoRef = useRef<PlayerRef>(null);

  const videoDuration = metadata?.duration ?? 100;

  const handleOneShot = useCallback(() => {
    log.debug('handleOneShot', pad);
    if (!pad) return;
    setPadIsOneShot(pad.id, !isPadOneShot);
  }, [pad, isPadOneShot, setPadIsOneShot]);

  useEffect(() => {
    if (!pad || !isEditActive) return;
    log.debug('selectedPadId', pad, metadata);
  }, [pad, metadata, isEditActive]);

  const handleStartAndEndTimeChange = useCallback(
    async (start: number, end: number) => {
      if (!pad) return;

      // grab a new thumbnail with the new start time
      const thumbnail = await videoRef.current?.getThumbnail(start);

      // applyPadTrimOperation(pad, start, end);
      applyPadTrimOperation({
        store,
        pad,
        start,
        end,
        thumbnail
      });
    },
    [pad, store]
  );

  const {
    handleSlideChange,
    handleSlideChangeEnd,
    slideValue,
    handleDurationBack,
    handleDurationForward
  } = useStartAndEndTime({
    isActive: isEditActive,
    pad,
    videoRef: videoRef.current,
    duration: videoDuration,
    onStartAndEndTimeChange: handleStartAndEndTimeChange
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.onReady(() => {
      // setDuration(metadata?.duration ?? 1000);
      log.debug('[onReady] duration', metadata?.duration);
      video.setCurrentTime(slideValue[0]);
    });
  }, [metadata, slideValue]);

  if (!isEditActive) return null;

  // log.debug('rendering', pad?.id, metadata);

  return (
    <Card className='absolute top-0 left-0 h-full w-full bg-gray-800 z-50'>
      <CardBody>
        <h3 className='font-semibold text-foreground/90'>
          Video Editor {pad?.id}
        </h3>
        <div className='relative w-full h-full'>
          {metadata && (
            <Player
              ref={videoRef}
              media={metadata}
              isOneShot={true}
              currentTime={slideValue[0]}
              isVisible={true}
              showControls={true}
            />
          )}
        </div>
        <Slider
          aria-label='Video duration'
          className='w-full'
          defaultValue={[0, videoDuration]}
          maxValue={videoDuration}
          minValue={0}
          step={0.1}
          value={slideValue}
          onChange={handleSlideChange}
          onChangeEnd={handleSlideChangeEnd}
          startContent={
            <DurationButton onPress={handleDurationBack}>
              <ChevronsLeft />
            </DurationButton>
          }
          endContent={
            <DurationButton onPress={handleDurationForward}>
              <ChevronsRight />
            </DurationButton>
          }
        />
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

const DurationButton = ({
  children,
  onPress
}: {
  children: React.ReactNode;
  onPress: () => void;
}) => {
  return (
    <Button isIconOnly radius='full' variant='light' onPress={onPress}>
      {children}
    </Button>
  );
};
