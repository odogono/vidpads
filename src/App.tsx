import { Suspense } from 'react';

import { Container } from '@components/Container';
import { Main } from '@components/Main';
import { EventsProvider } from '@helpers/events';
import { FFmpegProvider } from '@helpers/ffmpeg/provider';
import { KeyboardProvider } from '@helpers/keyboard/provider';
import { StoreProvider } from '@model/store/provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

const LoadingContainer = () => {
  return (
    <Container>
      <div className='flex items-center justify-center h-screen'>
        <div className='w-8 h-8 border-4 border-gray-600 mr-4 border-t-gray-400 rounded-full animate-spin' />
        <div className='text-gray-400'>Loading...</div>
      </div>
    </Container>
  );
};

export const App = () => {
  return (
    <Suspense fallback={<LoadingContainer />}>
      <QueryClientProvider client={queryClient}>
        <FFmpegProvider>
          <EventsProvider>
            <KeyboardProvider>
              <StoreProvider>
                <Main />
              </StoreProvider>
            </KeyboardProvider>
          </EventsProvider>
        </FFmpegProvider>
      </QueryClientProvider>
    </Suspense>
  );
};

export default App;
