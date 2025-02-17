'use client';

import Link from 'next/link';

import { BinComponent } from '@components/Bin';
import { Controls } from '@components/Controls';
import { FullScreenButton } from '@components/FullScreenButton';
import { MenuButton } from '@components/MenuButton';
import { PadContainer } from '@components/PadContainer';
import { PlayerContainer } from '@components/Player/Container';
import { Sequencer } from '@components/Sequencer';
import { ShareButton } from '@components/ShareButton';
import { cn } from '@helpers/tailwind';
import { useFullscreen } from '@hooks/useFullScreen';
import { PadDnDProvider } from '@hooks/usePadDnD/provider';
import { useShowMode } from '@model/hooks/useShowMode';
import { isMidiSupported } from '../helpers/midi';
import { MidiSetupModal } from './modals/MidiSetupModal';

export const Main = () => {
  const { isFullscreen, setIsFullscreen } = useFullscreen();
  const { isPadsVisible, isSequencerVisible } = useShowMode();
  const hasMidi = isMidiSupported();

  return (
    <PadDnDProvider>
      <div
        className={cn('w-full h-full rounded-lg', {
          'p-[1px] bg-[linear-gradient(135deg,var(--c6),var(--c0))]':
            !isFullscreen
        })}
      >
        <div
          className={cn(
            'vo-main vo-theme rounded-lg text-foreground bg-background w-full h-full flex flex-col',
            {
              'p-0': isFullscreen,
              'p-4': !isFullscreen
            }
          )}
        >
          <header
            className={cn(
              'flex justify-between w-full mx-auto p-2 items-center',
              isFullscreen ? 'hidden' : ''
            )}
          >
            <div className='text-white font-mono text-xl font-bold'>
              <Link href='/'>
                <span className='text-c5'>ODGN</span> VO PADS
              </Link>
            </div>
            <span className='flex items-center gap-2'>
              <FullScreenButton
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
                isStatic
              />
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
              className={`vo-player-wrapper relative w-full h-full min-h-[20vh] overflow-hidden ${isFullscreen ? 'bg-black' : 'bg-video-off'} rounded-lg`}
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
              {hasMidi && <MidiSetupModal />}
              <Controls />
              <div className='flex h-[50%] landscape:h-[40%]'>
                {isPadsVisible && <PadContainer />}
                {isSequencerVisible && <Sequencer />}
              </div>
            </>
          )}
        </div>
      </div>
    </PadDnDProvider>
  );
};
