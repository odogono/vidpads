import { QueryClient } from '@tanstack/react-query';

export const invalidateQueryKeys = (
  queryClient: QueryClient,
  queryKey: readonly string[][]
) => {
  return Promise.allSettled(
    queryKey.map((key) => queryClient.invalidateQueries({ queryKey: key }))
  );
};

export const invalidateAllQueries = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries();
};
