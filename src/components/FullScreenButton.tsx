import { useCallback, useEffect, useRef, useState } from 'react';

import { Maximize, Minimize } from 'lucide-react';

import { createLog } from '@helpers/log';
import { runAfter, type TimeoutId } from '@helpers/time';
import { Button, cn } from '@heroui/react';

const log = createLog('FullScreenButton', ['debug']);

export interface FullScreenButtonProps {
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
  isStatic?: boolean;
}

export const FullScreenButton = ({
  isFullscreen,
  setIsFullscreen,
  isStatic = false
}: FullScreenButtonProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const timeoutId = useRef<TimeoutId | null>(null);

  const handleChange = useCallback(() => {
    // Clear any existing timeout
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    setIsVisible(isFullscreen);

    // Set new timeout
    const newTimeoutId = runAfter(3000, () => setIsVisible(false));

    timeoutId.current = newTimeoutId;
  }, [timeoutId, setIsVisible, isFullscreen]);

  // Handle mouse movement
  useEffect(() => {
    if (isStatic) {
      return;
    }

    handleChange();

    // if (isFullscreen) {
    window.addEventListener('pointermove', handleChange);
    // } else {
    //   window.removeEventListener('pointermove', handleChange);
    // }

    return () => {
      window.removeEventListener('pointermove', handleChange);
    };
  }, [isFullscreen, handleChange, isStatic]);

  useEffect(() => {
    log.debug(
      'isVisible',
      isVisible,
      document.querySelector('.vo-fullscreen-button')
    );
  }, [isFullscreen, isVisible]);

  return (
    <Button
      color='primary'
      isIconOnly
      onPress={() => {
        log.debug('onPress', isFullscreen);
        setIsFullscreen(!isFullscreen);
      }}
      className={cn(
        `vo-fullscreen-button p-2 z-20 transition-opacity duration-300`,
        {
          'opacity-100': isVisible,
          'opacity-0': !isVisible || (!isStatic && !isFullscreen),
          'absolute top-16 left-3': !isStatic
        }
      )}
    >
      {isFullscreen ? (
        <Minimize className='h-6 w-6' />
      ) : (
        <Maximize className='h-6 w-6' />
      )}
    </Button>
  );
};
