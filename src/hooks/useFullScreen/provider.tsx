'use client';

import { useCallback, useEffect, useState } from 'react';

import { useEvents } from '@hooks/events';
import { FullScreenContext } from './context';

export const FullscreenContextProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areScreenDimsVisible, showScreenDims] = useState(false);

  const events = useEvents();

  const handleCancel = useCallback(() => {
    setIsFullscreen(false);
  }, [setIsFullscreen]);

  useEffect(() => {
    events.on('cmd:cancel', handleCancel);
    return () => {
      events.off('cmd:cancel', handleCancel);
    };
  }, [events, handleCancel]);

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
