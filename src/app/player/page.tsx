'use client';

import { LoadingSuspense } from '@components/Loading';
import { Main } from '@components/Main';
import { QueryClientContextProvider } from '@contexts/queryclient';
import { KeyboardProvider } from '@helpers/keyboard/provider';
import { ProjectProvider } from '@hooks/useProject/provider';
import { NextUIProvider } from '@nextui-org/react';

const Player = () => {
  return (
    <LoadingSuspense>
      <NextUIProvider disableAnimation className='w-full h-full flex flex-col'>
        <QueryClientContextProvider>
          <KeyboardProvider>
            <LoadingSuspense message='Loading project...'>
              <ProjectProvider>
                <Main />
              </ProjectProvider>
            </LoadingSuspense>
          </KeyboardProvider>
        </QueryClientContextProvider>
      </NextUIProvider>
    </LoadingSuspense>
  );
};

export default Player;
