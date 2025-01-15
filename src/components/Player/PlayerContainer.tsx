export type PlayerContainerProps = React.PropsWithChildren & {
  isVisible: boolean;
};

export const PlayerContainer = ({
  isVisible,
  children
}: PlayerContainerProps) => {
  return (
    <div
      className={`absolute top-0 left-0 w-full h-full ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
};
