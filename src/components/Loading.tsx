import { Suspense } from 'react';

import { Container } from '@components/Container';
import { createLog } from '@helpers/log';

const log = createLog('Loading');

export const LoadingContainer = ({
  message = 'Loading ...'
}: {
  message?: string;
}) => {
  log.debug('[LoadingContainer] ⚠️', message);
  return (
    <Container>
      <div className='flex items-center justify-center h-screen'>
        <div className='w-8 h-8 border-4 border-gray-600 mr-4 border-t-gray-400 rounded-full animate-spin' />
        <div className='text-gray-400'>{message}</div>
      </div>
    </Container>
  );
};

export const LoadingSuspense = ({
  children,
  message = 'Loading...'
}: {
  children: React.ReactNode;
  message?: string;
}) => {
  return (
    <Suspense fallback={<LoadingContainer message={message} />}>
      {children}
    </Suspense>
  );
};
