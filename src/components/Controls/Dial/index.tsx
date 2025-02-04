'use client';

import { useCallback, useRef } from 'react';

// import { createLog } from '@helpers/log';
import { roundNumberToDecimalPlaces as roundDP } from '@helpers/number';
import { cn } from '@helpers/tailwind';
import { useTouch } from './useTouch';

interface DialProps {
  label?: string;
  ref?: React.RefObject<HTMLDivElement>;
  value?: number;
  className?: string;
  size?: string;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  onDoubleTouch?: () => void;
}

// const log = createLog('dial');

export const Dial = ({
  label,
  ref,
  className,
  size = 'w-8',
  value = 0,
  minValue = 0,
  maxValue = 1,
  onChange,
  onChangeEnd,
  onDoubleTouch
}: DialProps) => {
  const startAngle = -135;
  const endAngle = 135;
  const lastValue = useRef(value);

  // 5 -> 1
  // 0.1 -> 0
  const valueToRange = useCallback(
    (value: number) => (value - minValue) / (maxValue - minValue),
    [minValue, maxValue]
  );

  const rangeToValue = useCallback(
    (value: number) => roundDP(value * (maxValue - minValue) + minValue, 2),
    [minValue, maxValue]
  );

  const valueToAngle = useCallback(
    (value: number) =>
      ((endAngle - startAngle) / (maxValue - minValue)) * (value - minValue),
    [startAngle, endAngle, minValue, maxValue]
  );

  const handleTouch = useCallback(
    (value: number) => {
      const normalisedValue = rangeToValue(value);
      if (lastValue.current !== normalisedValue) {
        onChange?.(normalisedValue);
        lastValue.current = normalisedValue;
        // log.debug('[Dial]', normalisedValue);
      }
    },
    [onChange, rangeToValue]
  );

  const touchHandlers = useTouch({
    onTouch: handleTouch,
    onTouchEnd: onChangeEnd,
    onDoubleTouch,
    value: valueToRange(value),
    minValue: 0,
    maxValue: 1
  });

  const angle = valueToAngle(value);

  return (
    <div className='flex flex-col gap-2 items-center'>
      <div
        ref={ref}
        className={cn(
          'aspect-square rounded-full bg-white/20 border border-white/30',
          size,
          className
        )}
        {...touchHandlers}
      >
        <div
          className='notch-container flex flex-col items-center justify-top w-full h-full'
          style={{ transform: `rotate(${startAngle + angle}deg)` }}
        >
          <div className='notch bg-slate-700 w-[8%] h-[30%]' />
        </div>
      </div>
      {label && <label className='text-sm'>{label}</label>}
    </div>
  );
};
