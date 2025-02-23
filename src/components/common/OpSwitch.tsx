'use client';

import { cn } from '@helpers/tailwind';
import { OpLabel } from './OpLabel';

export const OpSwitch = ({
  label,
  isSelected,
  isEnabled,
  onChange
}: {
  label?: string;
  isSelected: boolean | undefined;
  isEnabled: boolean;
  onChange: (value: boolean) => void;
}) => {
  const selected = isSelected ?? false;

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='h-12 flex items-center justify-center'>
        <button
          type='button'
          role='switch'
          aria-checked={selected}
          disabled={!isEnabled}
          onClick={() => onChange(!selected)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out',
            {
              'cursor-not-allowed opacity-50': !isEnabled,
              'cursor-pointer': isEnabled,
              'bg-[var(--c7)]': selected,
              'bg-primary-600': !selected
            }
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 rounded-full bg-primary-100 transform transition-transform duration-200 ease-in-out',
              {
                'translate-x-6': selected,
                'translate-x-1': !selected
              }
            )}
          />
        </button>
      </div>
      <OpLabel label={label} isEnabled={isEnabled} />
    </div>
  );
};
