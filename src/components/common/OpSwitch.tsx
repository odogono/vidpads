'use client';

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
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors duration-200 ease-in-out
            ${!isEnabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            ${selected ? 'bg-[var(--c7)]' : 'bg-primary-600'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 rounded-full bg-primary-100
              transform transition-transform duration-200 ease-in-out
              ${selected ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
      <OpLabel label={label} isEnabled={isEnabled} />
    </div>
  );
};
