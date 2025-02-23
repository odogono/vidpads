'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@heroui/react';

export const OpBiButton = ({
  isEnabled = true,
  onPressUp,
  onPressDown,
  size = 'md'
}: {
  isEnabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  onPressUp?: () => void;
  onPressDown?: () => void;
}) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='relative flex flex-col'>
        <Button
          isDisabled={!isEnabled}
          size={size}
          aria-label={'Up'}
          onPress={onPressUp}
          className={
            'aspect-[2/1] bg-primary hover:bg-primary-300 text-black rounded-b-none border-b-[1px] border-c10'
          }
        >
          <ChevronUp color='var(--foreground)' />
        </Button>
        <Button
          isDisabled={!isEnabled}
          size={size}
          aria-label={'Down'}
          onPress={onPressDown}
          className={
            'aspect-[2/1] bg-primary hover:bg-primary-300 text-black rounded-t-none'
          }
        >
          <ChevronDown color='var(--foreground)' />
        </Button>
      </div>
    </div>
  );
};
