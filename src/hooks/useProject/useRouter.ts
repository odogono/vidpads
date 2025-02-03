import { useCallback } from 'react';

import {
  useRouter as useNextRouter,
  usePathname,
  useSearchParams
} from 'next/navigation';

import { generateShortUUID } from '@helpers/uuid';

export const useRouter = () => {
  const router = useNextRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const projectId = searchParams.get('p') ?? 'new'; // generateShortUUID();
  const importData = searchParams.get('d');

  const setProjectId = useCallback(
    (projectId: string) => {
      const params = new URLSearchParams(searchParams);
      params.set('p', projectId);
      params.delete('d');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return {
    pathname,
    searchParams,
    setProjectId,
    projectId,
    importData
  };
};
