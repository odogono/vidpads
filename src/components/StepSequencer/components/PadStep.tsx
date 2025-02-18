'use client';

import { Indicator } from '@components/Indicator';
import { createLog } from '@helpers/log';
import { cn } from '@helpers/tailwind';
import { Pad } from '@model/types';

const log = createLog('stepSeq/PadStep');

interface PadStepProps {
  index: number;
  pad: Pad;
  onTouchStart?: (pad: Pad, step: number) => void;
  onTouchEnd?: (pad: Pad, step: number) => void;
  isActive?: boolean;
  isPlaying?: boolean;
}

export const PadStep = ({
  index,
  pad,
  onTouchStart,
  onTouchEnd,
  isActive,
  isPlaying
}: PadStepProps) => {
  return (
    <button
      onPointerDown={() => {
        onTouchStart?.(pad, index);
      }}
      onPointerUp={() => {
        onTouchEnd?.(pad, index);
      }}
      className={`min-w-[32px] min-h-[32px] flex items-center justify-center`}
      style={{
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        // Add these properties to prevent magnifying glass
        WebkitTapHighlightColor: 'transparent',
        // Prevent text selection and callouts
        userSelect: 'none'
      }}
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
            'bg-white': isPlaying,
            'bg-white/20 hover:bg-white/40': !isPlaying,
            'bg-white/60': isActive
          }
        )}
      >
        {/* <span className='absolute top-[10%] left-[10%]'>
          <Indicator isActive={isActive} />
        </span> */}
      </div>
    </button>
  );
};
