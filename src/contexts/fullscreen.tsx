'use client';

import { createContext, useContext, useState } from 'react';

import { createLog } from '@helpers/log';

export const FullscreenContext = createContext({
  isFullscreen: false,
  setIsFullscreen: (isFullscreen: boolean) => {}
});

const log = createLog('FullscreenContext');

export const FullscreenContextProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  log.debug('isFullscreen:', isFullscreen);

  return (
    <FullscreenContext.Provider value={{ isFullscreen, setIsFullscreen }}>
      {children}
    </FullscreenContext.Provider>
  );
};

export const useFullscreen = () => {
  return useContext(FullscreenContext);
};
