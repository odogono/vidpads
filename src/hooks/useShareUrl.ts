import { useCallback } from 'react';

import { useLocation, useSearchParams } from 'react-router';

export const useShareUrl = () => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const createNewUrl = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(newParams).forEach(([key, value]) => {
        params.set(key, value);
      });

      const baseUrl = window.location.origin;

      return `${baseUrl}${pathname}?${params.toString()}`;
    },
    [pathname, searchParams]
  );

  return {
    createNewUrl
  };
};
