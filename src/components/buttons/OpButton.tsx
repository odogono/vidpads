'use client';

import { forwardRef } from 'react';

import { useButton } from '@nextui-org/react';
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
      size?: 'sm' | 'md' | 'lg';
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
      lg: 'w-12 h-12'
    };

    return (
      <button
        ref={ref}
        {...getButtonProps()}
        className={`flex flex-col items-center justify-center group cursor-pointer focus:outline-none ${
          !isEnabled && 'opacity-50 cursor-not-allowed'
        }`}
      >
        <div
          className={`${sizeClasses[size]} 
          flex items-center justify-center 
          ${isEnabled ? 'bg-slate-400 group-hover:bg-slate-300' : 'bg-slate-200'} 
          text-black rounded-lg 
          aspect-square 
          focus:outline-none`}
        >
          {children}
        </div>
        <OpLabel label={label} isEnabled={isEnabled} />
      </button>
    );
  }
);

OpButton.displayName = 'OpButton';
