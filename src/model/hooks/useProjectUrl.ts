import { useEffect, useState } from 'react';

import { useShareUrl } from '@hooks/useShareUrl';
import { useProjects } from './useProjects';

export const useProjectUrl = () => {
  const { exportToURLString } = useProjects();
  const { createNewUrl } = useShareUrl({ isImport: true });

  const [url, setUrl] = useState('');

  useEffect(() => {
    const fetchUrl = async () => {
      const d = await exportToURLString();
      const url = createNewUrl({ d });
      setUrl(url);
    };
    fetchUrl();
  }, [exportToURLString, createNewUrl]);

  return url;
};
