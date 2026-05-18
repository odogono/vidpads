import { useCallback } from 'react';

import {
  useLocation,
  useNavigate,
  useSearchParams
} from 'react-router';

export const useRouter = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get('p') ?? 'new';
  const importData = searchParams.get('d');

  const setProjectId = useCallback(
    (projectId: string) => {
      const params = new URLSearchParams(searchParams);
      params.set('p', projectId);
      params.delete('d');
      navigate({ pathname, search: `?${params.toString()}` });
    },
    [navigate, pathname, searchParams]
  );

  return {
    pathname,
    searchParams,
    setProjectId,
    projectId,
    importData
  };
};
