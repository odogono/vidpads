import { cn } from '@heroui/react';

export const Indicator = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className='switcher-indicator'>
      <div
        className={cn(
          'aspect-square rounded-full w-[0.5vh] h-[0.5vh] bg-c0 ',
          isActive && 'bg-c3'
        )}
      ></div>
    </div>
  );
};
