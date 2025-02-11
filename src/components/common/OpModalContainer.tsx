import { cn } from '@helpers/tailwind';

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
        className={cn(
          `
        w-[50vw] h-[20vh] rounded-lg cursor-pointer relative
        flex items-center justify-center
        shadow-[0_0_15px_rgba(0,0,0,0.5)]
        transition-all duration-300 ease-in-out`,
          {
            'opacity-100 translate-y-0 visible': isVisible,
            'opacity-0 translate-y-10 invisible pointer-events-none': !isVisible
          },
          {
            'bg-bin-over scale-105': isHighlighted,
            'bg-bin': !isHighlighted
          }
        )}
      >
        {children}
      </div>
    </div>
  );
};
