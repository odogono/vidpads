'use client';

import { Input } from '@heroui/react';
import { useKeyboard } from '@hooks/useKeyboard';
import { OpLabel } from './OpLabel';

export const OpInput = ({
  label,
  value,
  onChange,
  isEnabled = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isEnabled: boolean;
}) => {
  const { setIsEnabled } = useKeyboard();
  return (
    <div className='flex flex-col items-center justify-center'>
      <Input
        className='min-w-[44px] min-h-[44px] w-16'
        type='number'
        color='primary'
        maxLength={9999}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        onFocus={() => setIsEnabled(false)}
        onBlur={() => setIsEnabled(true)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
      />

      <OpLabel label={label} isEnabled={isEnabled} />
    </div>
  );
};
