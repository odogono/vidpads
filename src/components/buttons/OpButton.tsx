'use client';

import { Button, Input, cn } from '@nextui-org/react';

export const OpButton = ({
  label,
  children,
  onPress
}: {
  label: string;
  children: React.ReactNode;
  onPress: () => void;
}) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <Button
        isIconOnly
        aria-label={label}
        onPress={onPress}
        className={cn(
          'min-w-[44px] min-h-[44px] aspect-square bg-slate-400 hover:bg-slate-300 text-black'
        )}
      >
        {children}
      </Button>
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
