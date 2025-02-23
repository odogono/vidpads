'use client';

import { Indicator } from '@components/Indicator';
import { cn } from '@helpers/tailwind';
import { useButton } from '@heroui/react';
import { OpLabel } from './OpLabel';

interface OpToggleButtonProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  isEnabled?: boolean;
  isSelected?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
}

export const OpToggleButton = ({
  label,
  isEnabled = true,
  isSelected = false,
  children,
  onPress,
  size = 'lg',
  ...props
}: OpToggleButtonProps) => {
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
      {...getButtonProps()}
      className={cn(
        'flex flex-col items-center justify-center group focus:outline-none',
        {
          'cursor-pointer': isEnabled,
          'opacity-50 cursor-not-allowed': !isEnabled
        }
      )}
    >
      <div
        className={`${sizeClasses[size]} 
          flex items-center justify-center relative
          ${isEnabled ? 'bg-primary text-foreground group-hover:bg-primary-300' : 'bg-primary'}
          ${isSelected ? 'bg-primary-400' : ''}
          text-black rounded-lg 
          aspect-square 
          focus:outline-none`}
      >
        <span className='absolute top-[10%] left-[10%]'>
          <Indicator isActive={isSelected} />
        </span>
        {children}
      </div>
      <OpLabel label={label} isEnabled={isEnabled} />
    </button>
  );
};
