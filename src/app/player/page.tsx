'use client';

import { LoadingSuspense } from '@components/Loading';
import { Main } from '@components/Main';
import { QueryClientContextProvider } from '@contexts/queryclient';
import { HeroUIProvider } from '@heroui/react';
import { KeyboardProvider } from '@hooks/useKeyboard/provider';
import { MidiProvider } from '@hooks/useMidi/provider';
import { ProjectProvider } from '@hooks/useProject/provider';
import { TimeSequencerProvider } from '@hooks/useTimeSequencer/provider';

const Player = () => {
  return (
    <LoadingSuspense>
      <HeroUIProvider disableAnimation className='w-full h-full flex flex-col'>
        <QueryClientContextProvider>
          <KeyboardProvider>
            <LoadingSuspense message='Loading project...'>
              <MidiProvider>
                <ProjectProvider>
                  <TimeSequencerProvider>
                    <Main />
                  </TimeSequencerProvider>
                </ProjectProvider>
              </MidiProvider>
            </LoadingSuspense>
          </KeyboardProvider>
        </QueryClientContextProvider>
      </HeroUIProvider>
    </LoadingSuspense>
  );
};

export default Player;
