export const omit = <T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> => {
  // Create a shallow copy of the original object
  const newObj = { ...obj };

  for (const key of keys) {
    // Remove the specified key
    delete newObj[key];
  }

  // Return the new object without the specified keys
  return newObj;
};
