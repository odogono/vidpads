'use client';

import { useCallback, useRef } from 'react';

import { OpTimeInput, OpTimeInputRef } from '@components/buttons/OpTimeInput';
import { createLog } from '@helpers/log';
import { roundNumberToDecimalPlaces } from '@helpers/number';
import { useMetadataByUrl } from '@model/hooks/useMetadata';
import { getPadInterval, getPadSourceUrl } from '@model/pad';
import { Pad } from '@model/types';
import { useControlsEvents } from '../hooks/useControlsEvents';

const log = createLog('NumericInterval');

export interface NumericIntervalProps {
  pad: Pad | undefined;
}

export const NumericInterval = ({ pad }: NumericIntervalProps) => {
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
      // log.debug('handleStartChange', value);
      const end = endTimeRef.current?.getValue();
      if (end === undefined) return;
      let newEnd = end;

      if (end < value) {
        newEnd = Math.min(value + 1, duration);
        endTimeRef.current?.setValue(newEnd);
      }

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

  return (
    <div className='flex flex-row gap-2'>
      <OpTimeInput
        ref={startTimeRef}
        initialValue={padStart}
        defaultValue={0}
        range={[0, duration]}
        description='Start'
        showIncrementButtons={true}
        onChange={handleStartChange}
      />
      <OpTimeInput
        ref={inputTimeRef}
        initialValue={0}
        defaultValue={0}
        description='Time'
        isDisabled={true}
      />
      <OpTimeInput
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
