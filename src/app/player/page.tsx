'use client';

import { Main } from '@components/Main';
import { QueryClientContextProvider } from '@contexts/queryclient';
import { EventsProvider } from '@helpers/events';
// import { FFmpegProvider } from '@helpers/ffmpeg/provider';
import { KeyboardProvider } from '@helpers/keyboard/provider';
import { StoreProvider } from '@model/store/provider';
import { NextUIProvider } from '@nextui-org/react';
import { LoadingSuspense } from '../../components/Loading';

const Player = () => {
  return (
    <LoadingSuspense>
      <NextUIProvider disableAnimation className='w-full h-full flex flex-col'>
        <QueryClientContextProvider>
          <EventsProvider>
            <KeyboardProvider>
              <LoadingSuspense message='Loading store...'>
                <StoreProvider>
                  <Main />
                </StoreProvider>
              </LoadingSuspense>
            </KeyboardProvider>
          </EventsProvider>
        </QueryClientContextProvider>
      </NextUIProvider>
    </LoadingSuspense>
  );
};

export default Player;
