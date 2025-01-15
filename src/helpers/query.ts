import { QueryClient } from '@tanstack/react-query';

export const invalidateQueryKeys = (
  queryClient: QueryClient,
  queryKey: string[][]
) => {
  queryKey.forEach((key) => {
    queryClient.invalidateQueries({
      queryKey: key
    });
  });
};
