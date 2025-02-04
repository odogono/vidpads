'use client';

import { forwardRef } from 'react';

import { useButton } from '@nextui-org/react';

export const OpButton = forwardRef(
  (
    {
      label,
      isEnabled = true,
      children,
      onPress,
      size = 'md',
      ...props
    }: {
      label?: string;
      size?: 'sm' | 'md' | 'lg';
      isEnabled?: boolean;
      children: React.ReactNode;
      onPress?: () => void;
    },
    ref: any
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
      lg: 'w-12 h-12'
    };

    return (
      <button
        ref={ref}
        {...getButtonProps()}
        className='flex flex-col items-center justify-center group cursor-pointer focus:outline-none'
      >
        <div
          className={`${sizeClasses[size]} flex items-center justify-center bg-slate-400 group-hover:bg-slate-300 text-black rounded-lg aspect-square focus:outline-none`}
        >
          {children}
        </div>
        {label && (
          <div
            className='text-xs text-foreground/90 mt-2'
            style={{
              fontSize: '0.6rem',
              lineHeight: '0.75rem'
            }}
          >
            {label}
          </div>
        )}
      </button>
    );
  }
);

OpButton.displayName = 'OpButton';
