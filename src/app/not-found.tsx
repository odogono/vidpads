import Link from 'next/link';

import { Trans as I18nTrans } from '@lingui/react/macro';
import { useTranslation } from '../i18n/useTranslation';

export default function NotFound() {
  const { i18n } = useTranslation();

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center'>
      <h1 className='font-mono text-6xl font-bold'>404</h1>
      <h2 className='text-2xl font-semibold'>Page Not Found</h2>
      <p className='text-muted-foreground'>
        {i18n._(`The page you're looking for doesn't exist or has been moved.`)}
      </p>
      <Link
        href='/'
        className='mt-4 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90'
      >
        <I18nTrans>Return Home</I18nTrans>
      </Link>
    </div>
  );
}
