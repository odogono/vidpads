'use client';

import { forwardRef } from 'react';

import { cn } from '@helpers/tailwind';
import { useButton } from '@heroui/react';
import { OpLabel } from './OpLabel';

export const OpButton = forwardRef(
  (
    {
      label,
      isEnabled = true,
      children,
      onPress,
      size = 'lg',
      ...props
    }: {
      label?: string;
      size?: 'sm' | 'md' | 'lg' | 'xl';
      isEnabled?: boolean;
      children: React.ReactNode;
      onPress?: () => void;
    },
    ref: React.Ref<HTMLButtonElement>
  ) => {
    const { getButtonProps } = useButton({
      isDisabled: !isEnabled,
      onPress,
      'aria-label': label,
      ...props
    });

    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-24 h-24'
    };

    return (
      <button
        ref={ref}
        {...getButtonProps()}
        className={cn(
          'vo-btn flex flex-col items-center justify-center group cursor-pointer focus:outline-none',
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
          {children}
        </div>
        <OpLabel label={label} isEnabled={isEnabled} />
      </button>
    );
  }
);

OpButton.displayName = 'OpButton';
