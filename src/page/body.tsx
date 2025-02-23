import { fontVariables } from '@page/fonts';

interface BodyProps extends React.PropsWithChildren {
  preventYScroll?: boolean;
}

export const Body = ({ preventYScroll = false, children }: BodyProps) => {
  return (
    <body
      className={`${fontVariables} bg-background antialiased font-sans`}
      style={{ overflowY: preventYScroll ? 'hidden' : 'auto' }}
    >
      {children}
    </body>
  );
};
