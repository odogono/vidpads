'use client';

import { LoadingSuspense } from '@components/Loading';
import { Main } from '@components/Main';
import { QueryClientContextProvider } from '@contexts/queryclient';
import { SequencerProvider } from '@contexts/sequencer';
import { HeroUIProvider } from '@heroui/react';
import { KeyboardProvider } from '@hooks/useKeyboard/provider';
import { MidiProvider } from '@hooks/useMidi/provider';
import { ProjectProvider } from '@hooks/useProject/provider';
import { SettingsProvider } from '@hooks/useSettings/provider';

// TODO dupe of player
const Import = () => {
  return (
    <LoadingSuspense>
      <HeroUIProvider disableAnimation className='w-full h-full flex flex-col'>
        <QueryClientContextProvider>
          <KeyboardProvider>
            <LoadingSuspense message='Loading project...'>
              <SettingsProvider>
                <ProjectProvider>
                  <MidiProvider>
                    <SequencerProvider>
                      <Main />
                    </SequencerProvider>
                  </MidiProvider>
                </ProjectProvider>
              </SettingsProvider>
            </LoadingSuspense>
          </KeyboardProvider>
        </QueryClientContextProvider>
      </HeroUIProvider>
    </LoadingSuspense>
  );
};

export default Import;
