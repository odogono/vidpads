import { PadContainer } from '@components/PadContainer';
import { useKeyboardControls } from '@helpers/keyboard';
import { PadDnDProvider } from '@hooks/usePadDnD/provider';
import { BinComponent } from './Bin';
import { Container } from './Container';
import { Controls } from './Controls';
import { VideoEditor } from './Editor/VideoEditor';
import { PlayerContainer } from './Player/Container';

export const Main = () => {
  useKeyboardControls();
  // useMidiControls();

  return (
    <PadDnDProvider>
      <Container>
        <h1 className='text-3xl font-bold mb-8'>Vid-Pads</h1>

        <div className='relative w-[800px] mx-auto'>
          <div className='relative w-[800px] h-[400px] transition-colors overflow-hidden'>
            <VideoEditor />
            <PlayerContainer />
          </div>
        </div>

        <div className='absolute left-1/2 -translate-x-1/2 top-[420px] z-60'>
          <BinComponent />
        </div>

        <Controls />

        <PadContainer />
      </Container>
    </PadDnDProvider>
  );
};
