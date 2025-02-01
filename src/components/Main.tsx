'use client';

import { BinComponent } from '@components/Bin';
import { Controls } from '@components/Controls';
import { FullScreenButton } from '@components/FullScreenButton';
import { MenuButton } from '@components/MenuButton';
import { PadContainer } from '@components/PadContainer';
import { PlayerContainer } from '@components/Player/Container';
import { Sequencer } from '@components/Sequencer';
import { ShareButton } from '@components/ShareButton';
import { useFullscreen } from '@hooks/useFullScreen';
import { PadDnDProvider } from '@hooks/usePadDnD/provider';
import { useWindowUrl } from '@hooks/useWindowUrl';
import { useShowMode } from '@model/hooks/useShowMode';

export const Main = () => {
  useWindowUrl();

  const { isFullscreen, setIsFullscreen } = useFullscreen();
  const { isPadsVisible, isSequencerVisible } = useShowMode();

  return (
    <PadDnDProvider>
      <div
        className={`vo-main w-full h-full text-white dark text-foreground flex flex-col ${
          isFullscreen ? 'p-0' : 'sm:p-[2vw] md:p-[3vw] lg:p-[5vw]'
        }`}
      >
        <header
          className={`flex justify-between w-full mx-auto items-center ${isFullscreen ? 'hidden' : ''}`}
        >
          <div className='text-white text-l font-bold'>ODGN VO PADS</div>
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
          <div
            className={`vo-player-wrapper relative w-full h-full min-h-[20vh] overflow-hidden ${isFullscreen ? 'bg-black' : 'bg-slate-500'} rounded-lg`}
          >
            <PlayerContainer />
          </div>

          <FullScreenButton
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
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
