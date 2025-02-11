import { cn } from '@heroui/react';

interface OpModalContainerProps extends React.PropsWithChildren {
  isVisible: boolean;
  isHighlighted?: boolean;
  height?: string;
  hasPointerEvents?: boolean;
}

export const OpModalContainer = ({
  isVisible,
  isHighlighted,
  children,
  height = '15vh',
  hasPointerEvents = false
}: OpModalContainerProps) => {
  return (
    <div
      className={cn(
        'vo-modal-container absolute left-1/2 -translate-x-1/2 top-[30vh] z-[9999]',
        {
          'pointer-events-auto': hasPointerEvents,
          'pointer-events-none': !hasPointerEvents
        }
      )}
    >
      <div
        className={`
        w-[50vw] h-[${height}] rounded-lg cursor-pointer relative
        flex items-center justify-center
        shadow-[0_0_15px_rgba(0,0,0,0.5)]
        transition-all duration-300 ease-in-out
        ${
          isVisible
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 translate-y-10 invisible pointer-events-none'
        }
        ${isHighlighted ? 'bg-bin-over scale-105' : 'bg-bin'}
      `}
      >
        {children}
      </div>
    </div>
  );
};
