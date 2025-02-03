import { useCallback } from 'react';

import {
  useRouter as useNextRouter,
  usePathname,
  useSearchParams
} from 'next/navigation';

import { createLog } from '@helpers/log';

const log = createLog('useProject/useRouter');

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

  // log.debug({ projectId });

  return {
    pathname,
    searchParams,
    setProjectId,
    projectId,
    importData
  };
};
