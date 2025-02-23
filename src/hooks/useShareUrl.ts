'use client';

import { useCallback } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';

export const useShareUrl = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createNewUrl = useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);

      // Add or update parameters
      Object.entries(newParams).forEach(([key, value]) => {
        params.set(key, value);
      });

      // Get the base URL including host and port
      const baseUrl =
        typeof window !== 'undefined' ? window.location.origin : '';

      return `${baseUrl}${pathname}?${params.toString()}`;
    },
    [pathname, searchParams]
  );

  return {
    createNewUrl
  };
};
