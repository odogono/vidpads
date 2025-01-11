import { Suspense } from 'react';

import { Container } from '@components/Container';
import { Main } from '@components/Main';
import { EventsProvider } from '@helpers/events';
import { FFmpegProvider } from '@helpers/ffmpeg/provider';
import { createLog } from '@helpers/log';
import { StoreProvider } from '@model/store/provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const log = createLog('App');
// Create a client
const queryClient = new QueryClient();

const LoadingContainer = () => {
  // log.debug('showing LoadingContainer');

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
            <StoreProvider>
              <Main />
            </StoreProvider>
          </EventsProvider>
        </FFmpegProvider>
      </QueryClientProvider>
    </Suspense>
  );
};

export default App;
