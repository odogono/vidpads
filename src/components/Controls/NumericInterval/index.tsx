'use client';

import { useCallback, useRef } from 'react';

import { ArrowLeftFromLine, ArrowRightFromLine } from 'lucide-react';

import { OpTimeInput, OpTimeInputRef } from '@/components/common/OpTimeInput';
import { createLog } from '@helpers/log';
import { roundNumberToDecimalPlaces } from '@helpers/number';
import { useMetadataByUrl } from '@model/hooks/useMetadata';
import { getPadInterval, getPadSourceUrl } from '@model/pad';
import { Pad } from '@model/types';
import { OpButton } from '../../common/OpButton';
import { useControlsEvents } from '../hooks/useControlsEvents';

const log = createLog('NumericInterval', ['debug']);

export interface NumericIntervalProps {
  pad: Pad | undefined;
  isEnabled?: boolean;
}

export const NumericInterval = ({ pad, isEnabled }: NumericIntervalProps) => {
  const startTimeRef = useRef<OpTimeInputRef | null>(null);
  const endTimeRef = useRef<OpTimeInputRef | null>(null);
  const inputTimeRef = useRef<OpTimeInputRef | null>(null);

  const padSourceUrl = getPadSourceUrl(pad);
  const { duration } = useMetadataByUrl(padSourceUrl);
  const { start: padStart, end: padEnd } = getPadInterval(pad, {
    start: 0,
    end: duration
  })!;

  log.debug('[NumericInterval] padSourceUrl', {
    padSourceUrl,
    duration,
    padStart,
    padEnd
  });

  const handleTimeUpdate = useCallback(
    (time: number) => {
      inputTimeRef.current?.setValue(time);
    },
    [inputTimeRef]
  );

  const { handleIntervalChange } = useControlsEvents({
    pad,
    onTimeUpdate: handleTimeUpdate
  });

  const handleStartChange = useCallback(
    (value: number) => {
      value = roundNumberToDecimalPlaces(value);
      const end = endTimeRef.current?.getValue();
      if (end === undefined) return;
      let newEnd = end;

      if (end < value) {
        newEnd = Math.min(value + 1, duration);
        endTimeRef.current?.setValue(newEnd);
      }

      log.debug('handleStartChange', { value, newEnd });
      handleIntervalChange(value, newEnd);
    },
    [handleIntervalChange, duration]
  );

  const handleEndChange = useCallback(
    (value: number) => {
      value = roundNumberToDecimalPlaces(value);
      const start = startTimeRef.current?.getValue();
      if (start === undefined) return;
      handleIntervalChange(start, value);
    },
    [handleIntervalChange]
  );

  const handleCopyTimeToStart = useCallback(() => {
    const start = inputTimeRef.current?.getValue();
    const end = endTimeRef.current?.getValue();
    if (start === undefined || end === undefined) return;
    startTimeRef.current?.setValue(start);
    handleIntervalChange(start, end);
  }, [inputTimeRef, startTimeRef, endTimeRef, handleIntervalChange]);

  const handleCopyTimeToEnd = useCallback(() => {
    const start = startTimeRef.current?.getValue();
    const end = inputTimeRef.current?.getValue();
    if (start === undefined || end === undefined) return;
    endTimeRef.current?.setValue(end);
    handleIntervalChange(start, end);
  }, [inputTimeRef, startTimeRef, endTimeRef, handleIntervalChange]);

  return (
    <div className='flex flex-row gap-2'>
      <OpTimeInput
        isEnabled={isEnabled}
        ref={startTimeRef}
        initialValue={padStart}
        defaultValue={0}
        range={[0, duration]}
        description='Start'
        showIncrementButtons={true}
        onChange={handleStartChange}
      />
      <OpButton size='sm' onPress={handleCopyTimeToStart} isEnabled={isEnabled}>
        <ArrowLeftFromLine />
      </OpButton>
      <OpTimeInput
        ref={inputTimeRef}
        initialValue={0}
        defaultValue={0}
        description='Time'
        isEnabled={false}
      />
      <OpButton size='sm' onPress={handleCopyTimeToEnd} isEnabled={isEnabled}>
        <ArrowRightFromLine />
      </OpButton>
      <OpTimeInput
        isEnabled={isEnabled}
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
