import { useEffect, useRef } from 'react';

import { createLog } from '@helpers/log';
import { useDBStore, useDBStoreUpdate } from '@model/db/api';
import { StoreContext } from './context';
import { createStore } from './store';
import type { StoreType } from './types';

const log = createLog('StoreProvider');

export const StoreProvider: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const storeRef = useRef<StoreType | null>(null);

  const { data: storeState } = useDBStore();
  const { mutate: saveState } = useDBStoreUpdate();

  if (!storeRef.current) {
    const isInitial = storeState?.isInitial ?? true;
    const store = createStore(storeState);
    storeRef.current = store;
    if (isInitial) {
      log.debug('initialising store');
      store.send({ type: 'initialiseStore' });
    }
  }

  // persist the store when it changes
  useEffect(() => {
    if (storeRef.current) {
      const sub = storeRef.current.subscribe((snapshot) => {
        log.info('store updated: saving state to IndexedDB:', snapshot);
        saveState(snapshot.context);
      });

      return () => {
        sub.unsubscribe();
      };
    }
  }, [saveState]);

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};
