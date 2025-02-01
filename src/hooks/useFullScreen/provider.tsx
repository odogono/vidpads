'use client';

import { useState } from 'react';

import { FullScreenContext } from './context';

export const FullscreenContextProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areScreenDimsVisible, showScreenDims] = useState(false);

  return (
    <FullScreenContext.Provider
      value={{
        isFullscreen,
        setIsFullscreen,
        areScreenDimsVisible,
        showScreenDims
      }}
    >
      {children}
    </FullScreenContext.Provider>
  );
};
