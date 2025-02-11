interface OpModalContainerProps extends React.PropsWithChildren {
  isVisible: boolean;
  isHighlighted?: boolean;
}

export const OpModalContainer = ({
  isVisible,
  isHighlighted,
  children
}: OpModalContainerProps) => {
  return (
    <div className='vo-modal-container absolute left-1/2 -translate-x-1/2 top-[30vh] z-50 pointer-events-none'>
      <div
        className={`
        w-[50vw] h-[15vh] rounded-lg cursor-pointer relative
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
