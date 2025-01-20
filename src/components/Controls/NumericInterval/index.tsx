import { useCallback, useEffect, useRef } from 'react';

import {
  PlayerThumbnailExtracted,
  PlayerTimeUpdate
} from '@components/Player/types';
import { debounce } from '@helpers/debounce';
import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { roundNumberToDecimalPlaces } from '@helpers/number';
import { useMetadataByUrl } from '@model/hooks/useMetadata';
import { usePadTrimOperation } from '@model/hooks/usePadTrimOperations';
import { getPadSourceUrl, getPadStartAndEndTime } from '@model/pad';
import { Pad } from '@model/types';
import { TimeInput, TimeInputRef } from './timeInput';

const log = createLog('NumericInterval', ['debug']);

export interface NumericIntervalProps {
  pad: Pad | undefined;
}

export const NumericInterval = ({ pad }: NumericIntervalProps) => {
  const events = useEvents();
  const startTimeRef = useRef<TimeInputRef | null>(null);
  const endTimeRef = useRef<TimeInputRef | null>(null);
  const inputTimeRef = useRef<TimeInputRef | null>(null);
  const applyPadTrimOperation = usePadTrimOperation();

  const padSourceUrl = getPadSourceUrl(pad);
  const { duration } = useMetadataByUrl(padSourceUrl);
  const { start: padStart, end: padEnd } = getPadStartAndEndTime(pad, {
    start: 0,
    end: duration
  })!;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleStartAndEndTimeChange = useCallback(
    debounce(async (start: number, end: number) => {
      if (!pad) return;
      const padSourceUrl = getPadSourceUrl(pad);
      if (!padSourceUrl) return;
      log.debug('handleStartAndEndTimeChange', start, end);
      // grab a new thumbnail with the new start time
      events.emit('video:extract-thumbnail', {
        url: padSourceUrl,
        time: start,
        padId: pad.id,
        requestId: `NumericInterval:${pad.id}`,
        additional: {
          start,
          end
        }
      });
    }, 500),
    [events, pad]
  );

  const handleThumbnailExtracted = useCallback(
    async ({ url, thumbnail, additional }: PlayerThumbnailExtracted) => {
      if (!pad) return;
      const padSourceUrl = getPadSourceUrl(pad);
      if (!padSourceUrl || url !== padSourceUrl) return;
      const { start, end } = { start: 0, end: 100, ...additional };
      // log.debug('[handleThumbnailExtracted]', pad.id, {
      //   start,
      //   end,
      //   requestId
      // });

      // todo: this shouldn't be done here
      await applyPadTrimOperation({
        pad,
        start,
        end,
        thumbnail
      });
    },
    [applyPadTrimOperation, pad]
  );

  const handleStartChange = useCallback(
    (value: number) => {
      value = roundNumberToDecimalPlaces(value);
      // log.debug('handleStartChange', value);
      const end = endTimeRef.current?.getValue();
      if (end === undefined) return;
      let newEnd = end;

      if (end < value) {
        newEnd = Math.min(value + 1, duration);
        endTimeRef.current?.setValue(newEnd);
      }

      handleStartAndEndTimeChange(value, newEnd);
    },
    [handleStartAndEndTimeChange, duration]
  );

  const handleEndChange = useCallback(
    (value: number) => {
      value = roundNumberToDecimalPlaces(value);
      const start = startTimeRef.current?.getValue();
      if (start === undefined) return;
      handleStartAndEndTimeChange(start, value);
    },
    [handleStartAndEndTimeChange]
  );

  const handlePlayerTimeUpdate = useCallback(
    (e: PlayerTimeUpdate) => {
      // log.debug('handlePlayerTimeUpdate', e.time, isPlayerReadyRef.current);
      if (e.padId !== pad?.id) return;
      // if (!isPlayerReadyRef.current) return;
      inputTimeRef.current?.setValue(e.time);
    },
    [pad]
  );

  useEffect(() => {
    events.on('player:time-update', handlePlayerTimeUpdate);
    events.on('video:thumbnail-extracted', handleThumbnailExtracted);
    return () => {
      events.off('player:time-update', handlePlayerTimeUpdate);
      events.off('video:thumbnail-extracted', handleThumbnailExtracted);
    };
  }, [events, handlePlayerTimeUpdate, handleThumbnailExtracted]);

  return (
    <div className='flex flex-row gap-2'>
      <TimeInput
        ref={startTimeRef}
        initialValue={padStart}
        defaultValue={0}
        range={[0, duration]}
        description='Start'
        showIncrementButtons={true}
        onChange={handleStartChange}
      />
      <TimeInput
        ref={inputTimeRef}
        initialValue={0}
        defaultValue={0}
        description='Time'
        isDisabled={true}
      />
      <TimeInput
        ref={endTimeRef}
        initialValue={padEnd}
        defaultValue={duration}
        range={[0, duration]}
        description='End'
        onChange={handleEndChange}
      />
    </div>
  );
};
