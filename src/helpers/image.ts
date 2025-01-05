export const createImageThumbnail = (
  file: File,
  size: number = 384
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate the dimensions to maintain aspect ratio while filling a square
      const scale = Math.max(size / img.width, size / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (size - scaledWidth) / 2;
      const offsetY = (size - scaledHeight) / 2;

      // Set canvas size to desired thumbnail size
      canvas.width = size;
      canvas.height = size;

      // Fill with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, size, size);

      // Draw image centered and scaled
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};
