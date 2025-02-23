import { useEffect, useState } from 'react';

import { useProjectUpdatedAt } from '@hooks/useProject/selectors';
import { useShareUrl } from '@hooks/useShareUrl';
import { useProjects } from './useProjects';

export const useProjectUrl = () => {
  const { exportToURLString } = useProjects();
  const { createNewUrl } = useShareUrl();
  const projectUpdatedAt = useProjectUpdatedAt();

  const [url, setUrl] = useState('');

  useEffect(() => {
    (async () => {
      const d = await exportToURLString();
      const url = createNewUrl({ d });
      setUrl(url);
    })();
  }, [exportToURLString, createNewUrl, projectUpdatedAt]);

  return url;
};
