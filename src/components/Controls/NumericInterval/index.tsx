import { useCallback, useEffect, useRef, useState } from 'react';

import {
  PlayerNotReady,
  PlayerReady,
  PlayerThumbnailExtracted,
  PlayerTimeUpdate
} from '@components/Player/types';
import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { useMetadataByUrl } from '@model/hooks/useMetadata';
import { usePadTrimOperation } from '@model/hooks/usePadTrimOperations';
import { getPadSourceUrl, getPadStartAndEndTime } from '@model/pad';
import { Pad } from '@model/types';
import { TimeInput, TimeInputRef } from './timeInput';

const log = createLog('NumericInterval');

export interface NumericIntervalProps {
  pad: Pad | undefined;
}

export const NumericInterval = ({ pad }: NumericIntervalProps) => {
  const events = useEvents();
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const startTimeRef = useRef<TimeInputRef | null>(null);
  const endTimeRef = useRef<TimeInputRef | null>(null);
  const inputTimeRef = useRef<TimeInputRef | null>(null);
  const isPlayerReadyRef = useRef<boolean>(false);
  const applyPadTrimOperation = usePadTrimOperation();

  const padSourceUrl = getPadSourceUrl(pad);
  const { duration } = useMetadataByUrl(padSourceUrl);

  const handleStartAndEndTimeChange = useCallback(
    async (start: number, end: number) => {
      if (!pad) return;
      const padSourceUrl = getPadSourceUrl(pad);
      if (!padSourceUrl) return;
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
    [events, pad]
  );

  const handleThumbnailExtracted = useCallback(
    async ({ url, thumbnail, additional }: PlayerThumbnailExtracted) => {
      if (!pad) return;
      const padSourceUrl = getPadSourceUrl(pad);
      if (!padSourceUrl || url !== padSourceUrl) return;
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
    [applyPadTrimOperation, pad]
  );

  const handleStartChange = useCallback(
    (value: number) => {
      setStart(value);
      let newEnd = end;

      if (end < value) {
        newEnd = value + 1;
        setEnd(newEnd);
        endTimeRef.current?.setValue(newEnd);
      }

      handleStartAndEndTimeChange(value, newEnd);
    },
    [handleStartAndEndTimeChange, end]
  );

  const handleEndChange = useCallback(
    (value: number) => {
      setEnd(value);
      handleStartAndEndTimeChange(start, value);
    },
    [handleStartAndEndTimeChange, start]
  );

  const handlePlayerReady = useCallback(
    (e: PlayerReady) => {
      if (e.padId !== pad?.id) return;
      isPlayerReadyRef.current = true;
    },
    [pad]
  );

  const handlePlayerNotReady = useCallback(
    (e: PlayerNotReady) => {
      if (e.padId !== pad?.id) return;
      inputTimeRef.current?.setValue(0);
      isPlayerReadyRef.current = false;
    },
    [pad]
  );

  const handlePlayerTimeUpdate = useCallback(
    (e: PlayerTimeUpdate) => {
      // log.debug('handlePlayerTimeUpdate', e.time, isPlayerReadyRef.current);
      if (e.padId !== pad?.id) return;
      if (!isPlayerReadyRef.current) return;
      inputTimeRef.current?.setValue(e.time);
    },
    [pad]
  );

  useEffect(() => {
    log.debug('useEffect', pad?.id);
    const { start: padStart, end: padEnd } = getPadStartAndEndTime(pad, {
      start: 0,
      end: 100
    })!;
    startTimeRef.current?.setValue(padStart);
    endTimeRef.current?.setValue(padEnd);
  }, [pad]);

  useEffect(() => {
    events.on('player:ready', handlePlayerReady);
    events.on('player:not-ready', handlePlayerNotReady);
    events.on('player:time-update', handlePlayerTimeUpdate);
    events.on('video:thumbnail-extracted', handleThumbnailExtracted);
    return () => {
      events.off('player:ready', handlePlayerReady);
      events.off('player:not-ready', handlePlayerNotReady);
      events.off('player:time-update', handlePlayerTimeUpdate);
      events.off('video:thumbnail-extracted', handleThumbnailExtracted);
    };
  }, [
    events,
    handlePlayerReady,
    handlePlayerNotReady,
    handlePlayerTimeUpdate,
    handleThumbnailExtracted
  ]);

  return (
    <div className='flex flex-row gap-2'>
      <TimeInput
        ref={startTimeRef}
        initialValue={start}
        defaultValue={0}
        description='Start'
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
        initialValue={end}
        defaultValue={duration}
        description='End'
        onChange={handleEndChange}
      />
    </div>
  );
};
