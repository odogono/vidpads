export const generateFileId = (file: File): string => {
  // Combine unique properties of the file
  const uniqueString = `${file.name}-${file.size}-${file.lastModified}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < uniqueString.length; i++) {
    const char = uniqueString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to hex string and ensure positive number
  return Math.abs(hash).toString(16);
};
