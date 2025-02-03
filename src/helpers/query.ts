import { QueryClient } from '@tanstack/react-query';

/**
 * Invalidate queries by query key
 *
 * @param queryClient
 * @param queryKey
 * @returns
 */
export const invalidateQueryKeys = (
  queryClient: QueryClient,
  queryKey: readonly string[][]
) => {
  return Promise.allSettled(
    queryKey.map((key) => queryClient.invalidateQueries({ queryKey: key }))
  );
};

/**
 *
 * @param queryClient
 * @returns
 */
export const invalidateAllQueries = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries();
};

/**
 * Reset all queries to their initial state
 *
 * This will notify subscribers — unlike clear, which removes all subscribers — and
 * reset the query to its pre-loaded state — unlike invalidateQueries.
 * If a query has initialData, the query's data will be reset to that.
 * If a query is active, it will be refetched.
 *
 * @param queryClient
 * @returns
 */
export const resetAllQueries = (queryClient: QueryClient) => {
  return queryClient.resetQueries();
};
