export const getIconSize = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return 32;
    case 'medium':
      return 48;
    case 'large':
      return 64;
    default:
      return 32;
  }
};
