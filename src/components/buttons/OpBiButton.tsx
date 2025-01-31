'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';

import { Button, cn } from '@nextui-org/react';

export const OpBiButton = ({
  label,
  onPressUp,
  onPressDown,
  size = 'md'
}: {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  onPressUp: () => void;
  onPressDown: () => void;
}) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='relative flex flex-col'>
        <Button
          size={size}
          aria-label={'Up'}
          onPress={onPressUp}
          className={cn(
            'aspect-[2/1] bg-slate-400 hover:bg-slate-300 text-black rounded-b-none border-b-[1px] border-slate-600'
          )}
        >
          <ArrowUp />
        </Button>
        <Button
          size={size}
          aria-label={'Down'}
          onPress={onPressDown}
          className={cn(
            'aspect-[2/1] bg-slate-400 hover:bg-slate-300 text-black rounded-t-none'
          )}
        >
          <ArrowDown />
        </Button>
      </div>
      <div className='flex gap-2 justify-center mt-2'>
        {label && (
          <div
            className='text-xs text-foreground/90'
            style={{
              fontSize: '0.6rem',
              lineHeight: '0.75rem'
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
};
