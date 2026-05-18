import { useEffect } from 'react';

interface BodyProps extends React.PropsWithChildren {
  preventYScroll?: boolean;
}

export const Body = ({ preventYScroll = false, children }: BodyProps) => {
  useEffect(() => {
    document.body.className = 'bg-background antialiased font-sans';
    document.body.style.overflowY = preventYScroll ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflowY = 'auto';
    };
  }, [preventYScroll]);

  return <>{children}</>;
};
