'use client';

import { PadContainer } from '@components/PadContainer';
import { useFullScreen } from '@hooks/useFullScreen';
import { PadDnDProvider } from '@hooks/usePadDnD/provider';
import { BinComponent } from './Bin';
import { Controls } from './Controls';
import { FullScreenButton } from './FullScreenButton';
import { PlayerContainer } from './Player/Container';
import { MenuButton } from './MenuButton';

export const Main = () => {
  const { isFullscreen, setFullscreen } = useFullScreen();

  return (
    <PadDnDProvider>
      <div className='min-h-screen text-white dark text-foreground bg-background'>
        <header className='flex justify-end p-4 max-w-6xl mx-auto'>
        <MenuButton />
      </header>
        <div className={`${isFullscreen ? 'p-0' : 'max-w-6xl mx-auto p-8'}`}>
          {!isFullscreen && <h1 className='font-bold mb-2'>VID-PAD-001</h1>}

          <div
            className={`relative ${isFullscreen ? 'w-screen h-screen' : 'w-[800px] mx-auto'}`}
          >
            <div
              className={`relative transition-all ${
                isFullscreen ? 'w-full h-full' : 'w-[800px] h-[400px]'
              } overflow-hidden`}
            >
              <PlayerContainer />
            </div>

            {/* Fullscreen toggle button */}
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
      </div>
    </PadDnDProvider>
  );
};
