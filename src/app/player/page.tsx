'use client';

import { LoadingSuspense } from '@components/Loading';
import { Main } from '@components/Main';
import { QueryClientContextProvider } from '@contexts/queryclient';
import { KeyboardProvider } from '@helpers/keyboard/provider';
import { ProjectProvider } from '@hooks/useProject/provider';
import { HeroUIProvider } from "@heroui/react";

const Player = () => {
  return (
    <LoadingSuspense>
      <HeroUIProvider disableAnimation className='w-full h-full flex flex-col'>
        <QueryClientContextProvider>
          <KeyboardProvider>
            <LoadingSuspense message='Loading project...'>
              <ProjectProvider>
                <Main />
              </ProjectProvider>
            </LoadingSuspense>
          </KeyboardProvider>
        </QueryClientContextProvider>
      </HeroUIProvider>
    </LoadingSuspense>
  );
};

export default Player;
