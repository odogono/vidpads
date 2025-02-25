import Link from 'next/link';

import { Body } from '@page/body';

export default function NotFound() {
  return (
    <Body>
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center'>
        <h1 className='font-mono text-6xl font-bold'>404</h1>
        <h2 className='text-2xl font-semibold'>Page Not Found</h2>
        <p className='text-muted-foreground'>
          {`The page you're looking for doesn't exist or has been moved.`}
        </p>
        <Link
          href='/'
          className='mt-4 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90'
        >
          Return Home
        </Link>
      </div>
    </Body>
  );
}
