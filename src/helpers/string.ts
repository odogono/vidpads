// Compress string
export const compressString = async (input: string): Promise<string> => {
  // Convert string to Uint8Array
  const bytes = new TextEncoder().encode(input);

  // Compress using GZIP
  const compressedStream = new Blob([bytes])
    .stream()
    .pipeThrough(new CompressionStream('gzip'));

  // Convert back to base64 string
  const compressedBytes = await new Response(compressedStream).arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(compressedBytes)));
};

// Decompress string
export const decompressString = async (compressed: string): Promise<string> => {
  // Convert base64 back to bytes
  const bytes = new Uint8Array(
    atob(compressed)
      .split('')
      .map((c) => c.charCodeAt(0))
  );

  // Decompress
  const decompressedStream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));

  // Convert back to string
  const decompressedBytes = await new Response(
    decompressedStream
  ).arrayBuffer();
  return new TextDecoder().decode(decompressedBytes);
};
