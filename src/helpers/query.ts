import { QueryClient } from '@tanstack/react-query';

export const invalidateQueryKeys = (
  queryClient: QueryClient,
  queryKey: string[][]
) => {
  return Promise.allSettled(
    queryKey.map((key) => queryClient.invalidateQueries({ queryKey: key }))
  );
};
