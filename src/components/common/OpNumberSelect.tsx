'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@helpers/tailwind';
import { OpLabel } from './OpLabel';

interface OpNumberSelectProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isEnabled?: boolean;
  onPressUp?: () => void;
  onPressDown?: () => void;

  value?: number;
  valueMax?: number;
}

export const OpNumberSelect = (props: OpNumberSelectProps) => {
  const {
    label,
    size = 'lg',
    isEnabled = true,
    value = 0,
    valueMax = 1
  } = props;

  const displayValue = `${(value ?? 0) + 1}`.padStart(2, '0');
  const displayValueMax = `${valueMax ?? 1}`.padStart(2, '0');
  const sizeClasses = {
    sm: 'w-10 h-8',
    md: 'w-12 h-10',
    lg: 'w-14 h-12',
    xl: 'w-26 h-24'
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center group focus:outline-none',
        {
          'opacity-50 cursor-not-allowed': !isEnabled
        }
      )}
    >
      <div className='flex flex-row items-center justify-center'>
        <div
          className={cn(
            `${sizeClasses[size]} 
          flex items-center justify-center
          rounded-l-lg 
          font-mono
          pointer-events-none
          focus:outline-none
          bg-secondary-800 text-secondary-500`
          )}
        >
          <span className='text-c6'>
            {displayValue}:{displayValueMax}
          </span>
        </div>
        <Buttons {...props} />
      </div>
      <OpLabel label={label} isEnabled={isEnabled} />
    </div>
  );
};

const Buttons = ({
  onPressUp,
  onPressDown,
  isEnabled
}: OpNumberSelectProps) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <button
        className={cn(
          'bg-primary hover:bg-primary-300 rounded-tr-lg w-8 flex justify-center',
          {
            'opacity-50 cursor-not-allowed': !isEnabled
          }
        )}
        onPointerDown={onPressUp}
      >
        <ChevronUp color='var(--foreground)' />
      </button>
      <button
        className={cn(
          'bg-primary hover:bg-primary-300 rounded-br-lg w-8 flex justify-center',
          {
            'opacity-50 cursor-not-allowed': !isEnabled
          }
        )}
        onPointerDown={onPressDown}
      >
        <ChevronDown color='var(--foreground)' />
      </button>
    </div>
  );
};
