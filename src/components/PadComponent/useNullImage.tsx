export const useNullImage = () => {
  const img = new Image();
  img.src =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
  img.width = 0;
  img.height = 0;
  img.style.opacity = '0';
  return img;
};
