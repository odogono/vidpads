import { useCallback, useState } from 'react';

// import { showSuccess } from '@helpers/toast';

export const useIsEnabled = () => {
  const [active, setActive] = useState(true);

  const setIsEnabled = useCallback((isEnabled: boolean) => {
    setActive(isEnabled);
    // showSuccess(isEnabled ? 'Keyboard enabled' : 'Keyboard disabled');
  }, []);

  return { isEnabled: active, setIsEnabled };
};
