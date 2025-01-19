'use client';

import { useCallback, useEffect } from 'react';

import { ChevronsLeft, ChevronsRight } from 'lucide-react';

import { useEvents } from '@helpers/events';
// import { createLog } from '@helpers/log';
import { useMetadataByUrl } from '@model/hooks/useMetadata';
import { usePadTrimOperation } from '@model/hooks/usePadTrimOperations';
import { getPadSourceUrl } from '@model/pad';
import { Pad } from '@model/types';
import { Slider } from '@nextui-org/react';
import { PlayerThumbnailExtracted } from '../Player/types';
import { DurationButton } from './DurationButton';
import { useStartAndEndTime } from './useStartAndEndTime';

export interface StartEndSliderProps {
  isEditActive?: boolean;
  pad?: Pad;
  selectedPadId?: string;
}

// const log = createLog('StartEndSlider');

export const StartEndSlider = ({ isEditActive, pad }: StartEndSliderProps) => {
  const events = useEvents();
  const padSourceUrl = getPadSourceUrl(pad);
  const metadata = useMetadataByUrl(padSourceUrl);
  const applyPadTrimOperation = usePadTrimOperation();

  const videoDuration = metadata?.duration ?? 100;

  const handleStartAndEndTimeChange = useCallback(
    async (start: number, end: number) => {
      if (!pad || !padSourceUrl) return;

      // grab a new thumbnail with the new start time
      events.emit('video:extract-thumbnail', {
        url: padSourceUrl,
        time: start,
        padId: pad.id,
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
      // log.debug('[handleThumbnailExtracted]', pad.id, start, end);

      // todo: this shouldn't be done here
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
    return () => {
      events.off('video:thumbnail-extracted', handleThumbnailExtracted);
    };
  }, [events, handleThumbnailExtracted]);

  useEffect(() => {
    if (padSourceUrl) {
      // events.emit('video:seek', {
      //   url: padSourceUrl,
      //   time: slideValue[0],
      //   inProgress: false,
      //   requesterId: 'start-end-slider'
      // });
    }
    // do not listen to slideValue or isSeeking
  }, [padSourceUrl, events]);

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
      showTooltip={true}
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
