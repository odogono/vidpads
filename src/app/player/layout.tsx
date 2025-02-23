'use client';

import { Tooltip } from '@components/Tooltip';
import { Toast } from '@helpers/toast';
import { useFullscreen } from '@hooks/useFullScreen';
import { Body } from '@page/body';

const PlayerLayout = ({ children }: { children: React.ReactNode }) => {
  const { isFullscreen, areScreenDimsVisible } = useFullscreen();

  return (
    <Body preventYScroll>
      <Tooltip />
      <Toast />
      <Container isFullscreen={isFullscreen}>{children}</Container>
      <ScreenDimsDebug isVisible={areScreenDimsVisible} />
    </Body>
  );
};

export default PlayerLayout;

const Container = ({
  children,
  isFullscreen
}: {
  children: React.ReactNode;
  isFullscreen: boolean;
}) => {
  return (
    <div
      className={`
          vo-root-a
          overflow-y-hidden
          ${
            isFullscreen
              ? `
            fixed inset-0 
            w-screen h-screen 
            bg-black`
              : `flex 
          w-screen 
          h-[100dvh] 
          bg-page 
          justify-center items-center`
          }
          
          overflow-hidden
        `}
      style={{
        backgroundImage: 'linear-gradient(#212d31, #091011), url(/noise.svg)'
      }}
    >
      <div
        className={`
            vo-root-b
            relative
            ${
              isFullscreen
                ? 'w-screen h-screen bg-black'
                : `w-full h-full bg-c0
                oh-blimey-this-is-a-mess
            portrait:lg:rounded-2xl 
            landscape:lg:rounded-2xl 
            portrait:sm:w-full
            portrait:sm:h-full
            portrait:md:w-[min(calc(100vw-40px),calc((100vh-40px)*0.707))]
            portrait:md:aspect-[724/1024]
            landscape:md:h-[min(calc(100vh-40px),calc((100vw-40px)*0.707))]
            landscape:md:aspect-[1024/724]
            portrait:lg:w-[min(calc(100vw-40px),calc((100vh-40px)*0.707))]
            portrait:lg:aspect-[724/1024]
            landscape:lg:h-[min(calc(100vh-40px),calc((100vw-40px)*0.707))]
            landscape:lg:aspect-[1024/724]
            `
            }
          `}
      >
        {children}
      </div>
    </div>
  );
};

const ScreenDimsDebug = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;
  return (
    <div className='absolute left-10 top-10 bg-black/50 text-white px-2 py-1 rounded text-sm font-mono'>
      <span className='block portrait:sm:hidden landscape:hidden'>
        {'<480px'}
      </span>
      <span className='hidden portrait:sm:block portrait:md:hidden landscape:hidden'>
        {'480-834px'}
      </span>
      <span className='hidden portrait:md:block portrait:lg:hidden landscape:hidden'>
        {'834-1440px'}
      </span>
      <span className='hidden portrait:lg:block landscape:hidden'>
        {'>1440px'}
      </span>

      <span className='hidden landscape:block landscape:sm:hidden'>
        {'<768px (L)'}
      </span>
      <span className='hidden landscape:sm:block landscape:md:hidden'>
        {'768-1024px (L)'}
      </span>
      <span className='hidden landscape:md:block landscape:lg:hidden'>
        {'1024-1440px (L)'}
      </span>
      <span className='hidden landscape:lg:block'>{'>1440px (L)'}</span>
    </div>
  );
};
