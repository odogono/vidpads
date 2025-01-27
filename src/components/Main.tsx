'use client';

import { PadContainer } from '@components/PadContainer';
import { useFullScreen } from '@hooks/useFullScreen';
import { PadDnDProvider } from '@hooks/usePadDnD/provider';
import { useWindowUrl } from '@hooks/useWindowUrl';
import { useShowMode } from '@model/hooks/useShowMode';
import { BinComponent } from './Bin';
import { Controls } from './Controls';
import { FullScreenButton } from './FullScreenButton';
import { MenuButton } from './MenuButton';
import { PlayerContainer } from './Player/Container';
import { Sequencer } from './Sequencer';
import { ShareButton } from './ShareButton';

export const Main = () => {
  useWindowUrl();

  const { isFullscreen, setFullscreen } = useFullScreen();
  const { isPadsVisible, isSequencerVisible } = useShowMode();

  return (
    <PadDnDProvider>
      <div
        className={`vo-main w-full h-full text-white dark text-foreground flex flex-col ${
          isFullscreen ? 'p-0' : 'p-8'
        }`}
      >
        <header
          className={`flex justify-between p-4 w-full mx-auto items-center ${isFullscreen ? 'hidden' : ''}`}
        >
          <div className='text-white text-xl font-bold'>ODGN VO-1</div>
          <span>
            <ShareButton />
            <MenuButton />
          </span>
        </header>

        <div
          className={`vo-fullscreen-wrapper relative ${
            isFullscreen ? 'fixed inset-0 w-screen h-screen z-50' : 'flex-1'
          }`}
        >
          <div className='vo-player-wrapper relative w-full h-full min-h-[20vh] overflow-hidden bg-slate-500 rounded-lg'>
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
            {isPadsVisible && <PadContainer />}
            {isSequencerVisible && <Sequencer />}
          </>
        )}
      </div>
    </PadDnDProvider>
  );
};
