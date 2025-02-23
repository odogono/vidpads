export const getApiBaseUrl = (): string => {
  if (!process.env.BASE_URL) {
    throw new Error('BASE_URL is undefined');
  }

  return process.env.BASE_URL;
};
