import { useContext } from 'react';

import { FullScreenContext } from './context';

export const useFullscreen = () => {
  return useContext(FullScreenContext);
};
