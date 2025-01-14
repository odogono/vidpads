import { useCallback, useEffect, useRef, useState } from 'react';

import { ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Player } from '@components/Player/Player';
import {
  PlayerReady,
  PlayerRef,
  PlayerThumbnailExtracted
} from '@components/Player/types';
import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { useMetadataFromPad } from '@model/hooks/useMetadataFromPad';
import { usePadTrimOperation } from '@model/hooks/usePadTrimOperations';
import { getPadSourceUrl } from '@model/pad';
import { useEditActive, usePad } from '@model/store/selectors';
import { Button, Card, CardBody, CardFooter, Slider } from '@nextui-org/react';
import { usePadTouches } from './usePadTouches';
import { useStartAndEndTime } from './useStartAndEndTime';

const log = createLog('VideoEditor');

export const VideoEditor = () => {
  const events = useEvents();
  const { isEditActive } = useEditActive();
  const { isLooped, isPadOneShot, pad, setPadIsLooped, setPadIsOneShot } =
    usePad();
  const padSourceUrl = getPadSourceUrl(pad);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const applyPadTrimOperation = usePadTrimOperation();

  const { data: metadata } = useMetadataFromPad(pad);

  const videoDuration = metadata?.duration ?? 100;

  const handleOneShot = useCallback(() => {
    if (!pad) return;
    setPadIsOneShot(pad.id, !isPadOneShot);
  }, [pad, isPadOneShot, setPadIsOneShot]);

  const handleLooped = useCallback(() => {
    if (!pad) return;
    setPadIsLooped(pad.id, !isLooped);
  }, [pad, isLooped, setPadIsLooped]);

  usePadTouches({
    isActive: isEditActive,
    pad
  });

  const handleStartAndEndTimeChange = useCallback(
    async (start: number, end: number) => {
      if (!pad || !padSourceUrl) return;

      // grab a new thumbnail with the new start time
      events.emit('video:extract-thumbnail', {
        url: padSourceUrl,
        time: start,
        additional: {
          start,
          end
        }
      });
    },
    [events, pad, padSourceUrl]
  );

  const handleThumbnailExtracted = useCallback(
    async ({ url, thumbnail, additional }: PlayerThumbnailExtracted) => {
      if (!pad || url !== padSourceUrl) return;
      const { start, end } = { start: 0, end: 100, ...additional };
      await applyPadTrimOperation({
        pad,
        start,
        end,
        thumbnail
      });
    },
    [applyPadTrimOperation, pad, padSourceUrl]
  );

  const handleVideoReady = useCallback(
    ({ url, duration, readyState, dimensions }: PlayerReady) => {
      if (url !== padSourceUrl) return;
      // setVideoDuration(duration);
      log.debug('[handleVideoReady]', { duration, readyState, dimensions });
      setIsPlayerReady(true);
    },
    [padSourceUrl]
  );

  useEffect(() => {
    events.on('video:thumbnail-extracted', handleThumbnailExtracted);
    events.on('video:ready', handleVideoReady);
    return () => {
      events.off('video:thumbnail-extracted', handleThumbnailExtracted);
      events.off('video:ready', handleVideoReady);
    };
  }, [events, handleThumbnailExtracted, handleVideoReady]);

  const {
    isSeeking,
    handleSlideChange,
    handleSlideChangeEnd,
    slideValue,
    handleDurationBack,
    handleDurationForward
  } = useStartAndEndTime({
    isActive: isEditActive ?? false,
    pad,
    duration: videoDuration,
    onStartAndEndTimeChange: handleStartAndEndTimeChange
  });

  useEffect(() => {
    if (!isPlayerReady) return;
    if (!isSeeking && padSourceUrl) {
      events.emit('video:seek', {
        url: padSourceUrl,
        time: slideValue[0],
        inProgress: false,
        requesterId: 'video-editor'
      });
    }
  }, [slideValue, isSeeking, padSourceUrl, events, isPlayerReady]);

  if (!isEditActive) return null;

  return (
    <Card className='absolute top-0 left-0 h-full w-full bg-gray-800 z-50'>
      <CardBody>
        <h3 className='font-semibold text-foreground/90'>
          Video Editor {pad?.id}
        </h3>
        <div className='relative w-full h-full'>
          {metadata && (
            <Player
              id='player-editor'
              media={metadata}
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
        <PadStateButton
          label='Loop'
          onPress={handleLooped}
          isActive={pad?.isLooped ?? false}
        />
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
