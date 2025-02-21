'use client';

// import { createLog } from '@helpers/log';
import { cn } from '@helpers/tailwind';
import { getPadLabel } from '@model/pad';
import { Pad } from '@model/types';

// const log = createLog('stepSeq/PadStep');

interface PadStepProps {
  index: number;
  pad: Pad;
  onTouchStart?: (pad: Pad, step: number) => void;
  onTouchEnd?: (pad: Pad, step: number) => void;
  onEnter?: (pad: Pad, step: number) => void;
  onLeave?: (pad: Pad, step: number) => void;
  isActive?: boolean;
  isPlaying?: boolean;
  isPadPlaying?: boolean;
}

export const PadStep = ({
  index,
  pad,
  onTouchStart,
  onTouchEnd,
  onEnter,
  onLeave,
  isActive,
  isPlaying,
  isPadPlaying
}: PadStepProps) => {
  const label = getPadLabel(pad) || pad.id;

  // truncate label to 4 characters
  const truncatedLabel = label.slice(0, 3);
  return (
    <button
      onPointerDown={() => onTouchStart?.(pad, index)}
      onPointerUp={() => onTouchEnd?.(pad, index)}
      onPointerEnter={() => onEnter?.(pad, index)}
      onPointerLeave={() => onLeave?.(pad, index)}
      className={cn(
        `min-w-[24px] min-h-[24px] flex items-center justify-center vo-step`,
        {
          'vo-step-playing': isPlaying,
          'vo-step-active': isActive
        }
      )}
      style={{
        touchAction: 'auto',
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
        flex items-center justify-center
        group`,
          {
            'bg-white/20 hover:bg-white/40': !isPlaying,
            'bg-white/40 animate-pulse': isPadPlaying && !isActive,
            'bg-white/70': isActive,
            'bg-white': isPlaying
          }
        )}
      >
        <span className='text-white absolute opacity-0 group-hover:opacity-100 transition-opacity'>
          {truncatedLabel}
        </span>
        {/* <span className='absolute top-[10%] left-[10%]'>
          <Indicator isActive={isActive} />
        </span> */}
      </div>
    </button>
  );
};
