'use client';

import { Indicator } from '@components/Indicator';
import { cn } from '@helpers/tailwind';
import { Pad } from '@model/types';

interface PadStepProps {
  index: number;
  pad: Pad;
  onPress?: (pad: Pad, step: number) => void;
  isActive?: boolean;
  isPlaying?: boolean;
}

export const PadStep = ({
  index,
  pad,
  onPress,
  isActive,
  isPlaying
}: PadStepProps) => {
  return (
    <button
      onClick={() => onPress?.(pad, index)}
      className={`min-w-[32px] min-h-[32px] flex items-center justify-center`}
    >
      <div
        className={cn(
          `relative
        aspect-square 
        w-[80%] h-[80%] 
        
        text-sm text-black 
        bg-white/20 rounded-sm 
        flex items-center justify-center`,
          {
            'bg-white': isPlaying
          }
        )}
      >
        <span className='absolute top-[10%] left-[10%]'>
          <Indicator isActive={isActive} />
        </span>
        {index}
      </div>
    </button>
  );
};
