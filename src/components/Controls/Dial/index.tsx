'use client';

import { useCallback } from 'react';

import { createLog } from '@helpers/log';
import { cn } from '@helpers/tailwind';
import { useTouch } from './useTouch';

interface DialProps {
  ref?: React.RefObject<HTMLDivElement>;
  value?: number;
  className?: string;
  size?: string;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
}

const log = createLog('dial');

export const Dial = ({
  ref,
  className,
  size = 'w-8',
  value = 0,
  onChange,
  onChangeEnd
}: DialProps) => {
  const startAngle = -135;

  const handleTouch = useCallback(
    (value: number) => {
      onChange?.(value);
    },
    [onChange]
  );

  const touchHandlers = useTouch({
    onTouch: handleTouch,
    onTouchEnd: onChangeEnd,
    value
  });

  const angle = value * 270;

  return (
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
  );
};
