'use client';

import { Input } from '@nextui-org/react';

export const OpInput = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <Input
        className='min-w-[44px] min-h-[44px] w-20'
        type='number'
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
      />

      <div
        className='text-xs text-foreground/90 mt-2'
        style={{
          fontSize: '0.6rem',
          lineHeight: '0.75rem'
        }}
      >
        {label}
      </div>
    </div>
  );
};
