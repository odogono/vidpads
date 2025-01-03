import { useRef } from 'react';

import { StoreContext } from './context';
import { createStore } from './store';
import type { StoreType } from './types';

type StoreProviderProps = React.PropsWithChildren<object>;

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const storeRef = useRef<StoreType | null>(null);

  if (!storeRef.current) {
    storeRef.current = createStore();
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};
