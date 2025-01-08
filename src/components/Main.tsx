import { TileContainer } from '@components/TileContainer';
import { PadDnDProvider } from '@hooks/usePadDnD/provider';
import { BinComponent } from './Bin';
import { Container } from './Container';
import { PlayerContainer } from './Player/Container';

export const Main = () => {
  return (
    <PadDnDProvider>
      <Container>
        <h1 className='text-3xl font-bold mb-8'>Vid-Wiz</h1>

        <PlayerContainer />

        <div className='absolute left-1/2 -translate-x-1/2 top-[300px] z-10'>
          <BinComponent />
        </div>

        <TileContainer />
      </Container>
    </PadDnDProvider>
  );
};
