import { createPortal } from 'react-dom';

interface EventTooltipProps {
  isVisible: boolean;
  x: number;
  y: number;
  onCut?: () => void;
  onDupe?: () => void;
  onSnap?: () => void;
}

export const EventTooltip = ({
  isVisible,
  x,
  y,
  onCut,
  onDupe,
  onSnap
}: EventTooltipProps) => {
  if (!isVisible) return null;

  const bgColor = 'bg-yellow-400';
  const borderColor = 'border-t-yellow-400';

  return createPortal(
    <div
      className='absolute z-50 bg-yellow-400 text-black px-2 py-1 rounded-md text-sm'
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -100%)`
      }}
    >
      <button
        className='hover:bg-yellow-500 px-2 py-1 rounded-md text-sm'
        onClick={onCut}
      >
        Cut
      </button>
      <button
        className='hover:bg-yellow-500 px-2 py-1 rounded-md text-sm'
        onClick={onDupe}
      >
        Dupe
      </button>
      <button
        className='hover:bg-yellow-500 px-2 py-1 rounded-md text-sm'
        onClick={onSnap}
      >
        Snap
      </button>

      <div
        className={`tooltip-arrow absolute left-1/2 top-full -translate-x-1/2 -mt-0 
                          border-solid border-t-8 border-x-8 border-b-0
                          ${borderColor} border-x-transparent`}
        aria-hidden='true'
      />
    </div>,
    document.body
  );
};
