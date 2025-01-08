import { PadContainer } from '@components/PadContainer';
import { PadDnDProvider } from '@hooks/usePadDnD/provider';
import { BinComponent } from './Bin';
import { Container } from './Container';
import { Controls } from './Controls';
import { PlayerContainer } from './Player/Container';

export const Main = () => {
  return (
    <PadDnDProvider>
      <Container>
        <h1 className='text-3xl font-bold mb-8'>Vid-Pads</h1>

        <PlayerContainer />

        <div className='absolute left-1/2 -translate-x-1/2 top-[420px] z-10'>
          <BinComponent />
        </div>

        <Controls />

        <PadContainer />
      </Container>
    </PadDnDProvider>
  );
};
