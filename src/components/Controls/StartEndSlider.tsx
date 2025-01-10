import { useCallback, useEffect } from 'react';

import { ChevronsLeft, ChevronsRight } from 'lucide-react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { useMetadataFromPad, usePadTrimOperation } from '@model';
import { getPadSourceUrl } from '@model/pad';
import { Pad } from '@model/types';
import { Slider } from '@nextui-org/react';
import { useStartAndEndTime } from '../Editor/useStartAndEndTime';
import { PlayerThumbnailExtracted } from '../Player/types';
import { DurationButton } from './DurationButton';

export interface StartEndSliderProps {
  isEditActive?: boolean;
  pad?: Pad;
  selectedPadId?: string;
}

const log = createLog('StartEndSlider');

export const StartEndSlider = ({
  isEditActive,
  pad,
  selectedPadId
}: StartEndSliderProps) => {
  const events = useEvents();
  const padSourceUrl = getPadSourceUrl(pad);
  const { data: metadata } = useMetadataFromPad(pad);
  const applyPadTrimOperation = usePadTrimOperation();

  const videoDuration = metadata?.duration ?? 100;

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
      log.debug('[handleThumbnailExtracted]', pad.id, start, end);
      await applyPadTrimOperation({
        pad,
        start,
        end,
        thumbnail
      });
    },
    [applyPadTrimOperation, pad, padSourceUrl]
  );

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
    events.on('video:thumbnail-extracted', handleThumbnailExtracted);
    // events.on('video:ready', handleVideoReady);
    return () => {
      events.off('video:thumbnail-extracted', handleThumbnailExtracted);
      // events.off('video:ready', handleVideoReady);
    };
  }, [events, handleThumbnailExtracted]);

  useEffect(() => {
    if (!isSeeking && padSourceUrl) {
      events.emit('video:seek', { url: padSourceUrl, time: slideValue[0] });
    }
  }, [slideValue, isSeeking, padSourceUrl, events]);

  // log.debug('selectedPadId', pad?.id, slideValue);

  return (
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
  );
};
