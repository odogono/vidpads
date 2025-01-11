import { useState } from 'react';

import { PadContainer } from '@components/PadContainer';
import { useKeyboardControls } from '@helpers/keyboard';
import { PadDnDProvider } from '@hooks/usePadDnD/provider';
import { BinComponent } from './Bin';
import { Controls } from './Controls';
import { FullScreenButton } from './FullScreenButton';
import { PlayerContainer } from './Player/Container';

export const Main = () => {
  useKeyboardControls();
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <PadDnDProvider>
      <div className='min-h-screen bg-gray-900 text-white'>
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
              setIsFullscreen={setIsFullscreen}
            />
          </div>

          {!isFullscreen && (
            <>
              <div className='absolute left-1/2 -translate-x-1/2 top-[420px] z-60'>
                <BinComponent />
              </div>

              <Controls />

              <PadContainer />
            </>
          )}
        </div>
      </div>
    </PadDnDProvider>
  );
};
