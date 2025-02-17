'use client';

import { usePathname, useSearchParams } from 'next/navigation';

interface UseShareUrlProps {
  isImport?: boolean;
}

export const useShareUrl = ({ isImport = false }: UseShareUrlProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createNewUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    const preferredPathName = isImport ? '/import' : pathname;

    // Add or update parameters
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    // Get the base URL including host and port
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    return `${baseUrl}${preferredPathName}?${params.toString()}`;
  };

  return {
    createNewUrl
  };
};
