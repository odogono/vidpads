import { Suspense } from 'react';

import { Container } from '@components/Container';
import { LoadingSpinner } from '@components/LoadingSpinner';
import { createLog } from '@helpers/log';

const log = createLog('Loading', ['debug']);

export const LoadingContainer = ({
  message = 'Loading ...'
}: {
  message?: string;
}) => {
  log.debug('[LoadingContainer] ⚠️', message);
  return (
    <Container>
      <div className='flex items-center justify-center h-screen gap-4'>
        <LoadingSpinner />
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
