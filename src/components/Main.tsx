import { useRef, useState } from 'react';

import { TileContainer } from '@components/TileContainer';
import { useFFmpeg } from '@helpers/ffmpeg/useFFmpeg';
import { createLog } from '@helpers/log';
import { checkStorageQuota } from '@model/mediaDb';
import { BinComponent } from './Bin';
import { Container } from './Container';
import { DragProvider } from './DragContext';
import { PlayerContainer } from './Player/Container';

const log = createLog('App');

export const Main = () => {
  return (
    <DragProvider>
      <Container>
        <h1 className='text-3xl font-bold mb-8'>Vid-Wiz</h1>

        <PlayerContainer />

        <div className='absolute left-1/2 -translate-x-1/2 top-[300px] z-10'>
          <BinComponent />
        </div>

        <TileContainer />
      </Container>
    </DragProvider>
  );
};
