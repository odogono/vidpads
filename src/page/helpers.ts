import { headers } from 'next/headers';

export const getApiBaseUrl = async (): Promise<{
  currentUrl: string;
  metadataBase: URL;
}> => {
  const headersList = await headers();

  const scheme = headersList.get('x-forwarded-proto') || 'http';
  const hostname = headersList.get('host');
  const pathname = headersList.get('x-invoke-path') || '';

  const currentUrl = `${scheme}://${hostname}${pathname}`;
  const metadataBase = new URL(scheme + '://' + hostname);

  return { currentUrl, metadataBase };
};
