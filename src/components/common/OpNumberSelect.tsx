'use client';

import { cn } from '@helpers/tailwind';
import { useButton } from '@heroui/react';
import { OpLabel } from './OpLabel';

export const OpNumberSelect = ({
  label,
  isEnabled = true,
  onPress,
  size = 'lg',
  value = 0,
  valueMax = 1,
  ...props
}: {
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isEnabled?: boolean;
  onPress?: () => void;
  value?: number;
  valueMax?: number;
}) => {
  const { getButtonProps } = useButton({
    isDisabled: !isEnabled,
    onPress,
    'aria-label': label,
    ...props
  });

  const displayValue = value ?? 0;
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-24 h-24'
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center group pointer-events-none focus:outline-none',
        {
          'opacity-50 cursor-not-allowed': !isEnabled
        }
      )}
    >
      <div
        className={cn(
          `${sizeClasses[size]} 
          flex items-center justify-center
          text-black rounded-lg 
          aspect-square 
          focus:outline-none`,
          {
            'bg-primary text-foreground hover:bg-primary/90': isEnabled,
            'bg-primary opacity-50 cursor-not-allowed': !isEnabled
          }
        )}
      >
        <span className='text-white'>
          {displayValue + 1}/{valueMax}
        </span>
      </div>
      <OpLabel label={label} isEnabled={isEnabled} />
    </div>
  );
};

OpNumberSelect.displayName = 'OpNumberSelect';
