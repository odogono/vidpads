import { useCallback } from 'react';

import { createPortal } from 'react-dom';

type Handler = () => void | undefined;

interface EventTooltipProps {
  isVisible: boolean;
  isEventsSelected?: boolean;
  x: number;
  y: number;
  onCut?: Handler;
  onCopy?: Handler;
  onDupe?: Handler;
  onSnap?: Handler;
  onPaste?: Handler;
}

export const EventTooltip = ({
  isVisible,
  isEventsSelected,
  x,
  y,
  onCut,
  onCopy,
  onDupe,
  onSnap,
  onPaste
}: EventTooltipProps) => {
  const TooltipButton = useCallback(
    ({
      children,
      onPress
    }: {
      children: React.ReactNode;
      onPress?: Handler;
    }) => (
      <button
        className='hover:bg-tooltip-over px-2 py-1 rounded-md text-sm'
        onClick={onPress}
      >
        {children}
      </button>
    ),
    []
  );

  if (!isVisible) return null;

  return createPortal(
    <div
      className='absolute z-50 bg-tooltip text-black px-2 py-1 rounded-md text-sm'
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -100%)`
      }}
    >
      {isEventsSelected && (
        <>
          <TooltipButton onPress={onCut}>Cut</TooltipButton>
          <TooltipButton onPress={onCopy}>Copy</TooltipButton>
          <TooltipButton onPress={onDupe}>Dupe</TooltipButton>
          <TooltipButton onPress={onSnap}>Snap</TooltipButton>
        </>
      )}

      {!isEventsSelected && (
        <TooltipButton onPress={onPaste}>Paste</TooltipButton>
      )}

      <div
        className={`tooltip-arrow absolute left-1/2 top-full -translate-x-1/2 -mt-0 
                          border-solid border-t-8 border-x-8 border-b-0
                          border-t-tooltip border-x-transparent`}
        aria-hidden='true'
      />
    </div>,
    document.body
  );
};
