'use client';

import { PadContainer } from '@components/PadContainer';
import { useFullScreen } from '@hooks/useFullScreen';
import { PadDnDProvider } from '@hooks/usePadDnD/provider';
import { useWindowUrl } from '@hooks/useWindowUrl';
import { BinComponent } from './Bin';
import { Controls } from './Controls';
import { FullScreenButton } from './FullScreenButton';
import { MenuButton } from './MenuButton';
import { PlayerContainer } from './Player/Container';

export const Main = () => {
  useWindowUrl();

  const { isFullscreen, setFullscreen } = useFullScreen();

  return (
    <PadDnDProvider>
      <div
        id='player-main'
        className={`w-full h-full text-white dark text-foreground flex flex-col ${
          isFullscreen ? 'p-0' : 'p-8'
        }`}
      >
        <header
          className={`flex justify-between p-4 w-full mx-auto items-center ${isFullscreen ? 'hidden' : ''}`}
        >
          <div className='text-white text-xl font-bold'>ODGN VO-1</div>
          <MenuButton />
        </header>

        <div
          id='fullscreen-wrapper'
          className={`relative ${
            isFullscreen ? 'fixed inset-0 w-screen h-screen z-50' : 'flex-1'
          }`}
        >
          <div
            id='player-wrapper'
            className='relative w-full h-full overflow-hidden'
          >
            <PlayerContainer />
          </div>

          <FullScreenButton
            isFullscreen={isFullscreen}
            setIsFullscreen={setFullscreen}
          />
        </div>

        {!isFullscreen && (
          <>
            <BinComponent />
            <Controls />
            <PadContainer />
          </>
        )}
      </div>
    </PadDnDProvider>
  );
};
