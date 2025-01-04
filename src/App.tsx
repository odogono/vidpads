import { Suspense } from 'react';

import { Container } from '@components/Container';
import { Main } from '@components/Main';
import { createLog } from '@helpers/log';
import { StoreProvider } from '@model/store/provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const log = createLog('App');
// Create a client
const queryClient = new QueryClient();

const LoadingContainer = () => {
  log.debug('showing LoadingContainer');

  return (
    <Container>
      <div className='flex items-center justify-center h-screen'>
        <div className='text-gray-400'>Loading...</div>
      </div>
    </Container>
  );
};

export const App = () => {
  return (
    <Suspense fallback={<LoadingContainer />}>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <Main />
        </StoreProvider>
      </QueryClientProvider>
    </Suspense>
  );
};

export default App;
