'use client';

import { useKeyboard } from '@helpers/keyboard/useKeyboard';
import { Input } from "@heroui/react";

export const OpInput = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const { setIsEnabled } = useKeyboard();
  return (
    <div className='flex flex-col items-center justify-center'>
      <Input
        className='min-w-[44px] min-h-[44px] w-16'
        type='number'
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
    </div>
  );
};
