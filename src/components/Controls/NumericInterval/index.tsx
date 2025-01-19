import { useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { getPadStartAndEndTime } from '@model/pad';
import { Pad } from '@model/types';
import { TimeInput } from './timeInput';

const log = createLog('NumericInterval');

export interface NumericIntervalProps {
  pad: Pad | undefined;
}

export const NumericInterval = ({ pad }: NumericIntervalProps) => {
  const events = useEvents();
  const { start: padStart, end: padEnd } = getPadStartAndEndTime(pad, {
    start: 0,
    end: 100
  })!;

  const [start, setStart] = useState<number>(padStart);
  const [end, setEnd] = useState<number>(padEnd);

  return (
    <div className='flex flex-row gap-2'>
      <TimeInput initialValue={start} description='Start' onChange={setStart} />
      <TimeInput initialValue={0} description='Time' />
      <TimeInput initialValue={end} description='End' onChange={setEnd} />
    </div>
  );
};
