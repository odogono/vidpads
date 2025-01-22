'use client';

import { useCallback, useState } from 'react';

import { createLog } from '@helpers/log';
import { cn } from '@helpers/tailwind';
import { useTouch } from './useTouch';

interface DialProps {
  value?: number;
  className?: string;
  size?: string;
}

const log = createLog('dial');

export const Dial = ({ className, size = 'w-8', value = 0 }: DialProps) => {
  const startAngle = -135;

  const [dialValue, setDialValue] = useState(value);

  const handleTouch = useCallback((value: number) => {
    // log.debug('handleTouch', value);
    setDialValue(value);
  }, []);

  const handleTouchEnd = useCallback(() => {}, []);

  const touchHandlers = useTouch({
    onTouch: handleTouch,
    onTouchEnd: handleTouchEnd
  });

  const angle = dialValue * 270;

  return (
    <div
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
