/**
 * Generates a RFC4122 version 4 compliant UUID
 * @returns A randomly generated UUID string
 */
export const generateUUID = (): string => {
  // Get current timestamp in hex (last 8 chars)
  const timestamp = Date.now().toString(16).slice(-8);

  // Generate the rest of the UUID with timestamp prefix
  return `${timestamp}-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generates a short UUID string
 * @returns A short UUID string that includes timestamp
 */
export const generateShortUUID = (): string => {
  // Get current timestamp in hex (last 6 chars)
  const timestamp = Date.now().toString(16).slice(-6);
  // Add 4 random chars
  const random = Math.random().toString(16).slice(2, 6);
  return timestamp + random;
};
