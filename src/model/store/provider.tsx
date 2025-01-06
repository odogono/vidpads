import { useEffect } from 'react';

import { createLog } from '@helpers/log';
import { loadStateFromIndexedDB, saveStateToIndexedDB } from '@model/db/api';
import { useSuspenseQuery } from '@tanstack/react-query';
import { StoreContext } from './context';
import { createStore } from './store';

const log = createLog('StoreProvider');

export const StoreProvider: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const { data: store } = useSuspenseQuery({
    queryKey: ['store-initialise'],
    queryFn: async () => {
      const storeState = await loadStateFromIndexedDB();
      const isInitial = storeState?.isInitial ?? true;
      const store = createStore(storeState ?? undefined);

      if (isInitial) {
        log.debug('initialising store');
        store.send({ type: 'initialiseStore' });
        const snapshot = store.getSnapshot();
        await saveStateToIndexedDB(snapshot.context);
      }

      return store;
    }
  });

  // persist the store when it changes
  useEffect(() => {
    if (store) {
      log.debug('subscribing to store updates');
      const sub = store.subscribe((snapshot) => {
        log.info('store updated: saving state to IndexedDB:', snapshot);
        saveStateToIndexedDB(snapshot.context);
      });

      return () => {
        sub.unsubscribe();
      };
    }
  }, [store]);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
