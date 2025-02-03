'use client';

import { Button, cn } from '@nextui-org/react';

export const OpButton = ({
  label,
  isEnabled,
  children,
  onPress,
  size = 'md'
}: {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  isEnabled?: boolean;
  children: React.ReactNode;
  onPress: () => void;
}) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <Button
        isIconOnly
        size={size}
        aria-label={label}
        onPress={onPress}
        isDisabled={!isEnabled}
        className={cn(
          'aspect-square bg-slate-400 hover:bg-slate-300 text-black'
        )}
      >
        {children}
      </Button>
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
