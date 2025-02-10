'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';

import { Button } from '@heroui/react';

export const OpBiButton = ({
  onPressUp,
  onPressDown,
  size = 'md'
}: {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  onPressUp?: () => void;
  onPressDown?: () => void;
}) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='relative flex flex-col'>
        <Button
          size={size}
          aria-label={'Up'}
          onPress={onPressUp}
          className={
            'aspect-[2/1] bg-primary hover:bg-primary-300 text-black rounded-b-none border-b-[1px] border-primary-300'
          }
        >
          <ArrowUp color='var(--foreground)' />
        </Button>
        <Button
          size={size}
          aria-label={'Down'}
          onPress={onPressDown}
          className={
            'aspect-[2/1] bg-primary hover:bg-primary-300 text-black rounded-t-none'
          }
        >
          <ArrowDown color='var(--foreground)' />
        </Button>
      </div>
    </div>
  );
};
