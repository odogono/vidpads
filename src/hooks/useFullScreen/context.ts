'use client';

import { createContext } from 'react';

export type FullScreenContextType = {
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
  areScreenDimsVisible: boolean;
  showScreenDims: (show: boolean) => void;
};

export const FullScreenContext = createContext<FullScreenContextType>({
  isFullscreen: false,
  setIsFullscreen: () => {},
  areScreenDimsVisible: false,
  showScreenDims: () => {}
});
