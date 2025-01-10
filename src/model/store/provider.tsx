import { useEffect, useRef } from 'react';

import { getObjectDiff, isObjectEqual } from '@helpers/diff';
import { createLog } from '@helpers/log';
import { loadStateFromIndexedDB, saveStateToIndexedDB } from '@model/db/api';
import { StoreContextType } from '@model/store/types';
import { useSuspenseQuery } from '@tanstack/react-query';
import { StoreContext } from './context';
import { createStore } from './store';

const log = createLog('StoreProvider');

export const StoreProvider: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const snapshotRef = useRef<StoreContextType | null>(null);

  const { data: store, isSuccess } = useSuspenseQuery({
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
        snapshotRef.current = snapshot.context;
      }

      return store;
    }
  });

  // persist the store when it changes
  useEffect(() => {
    if (store) {
      // log.debug('subscribing to store updates');
      const sub = store.subscribe((snapshot) => {
        const hasChanged = !isObjectEqual(
          snapshotRef.current ?? {},
          snapshot.context
        );
        if (hasChanged) {
          // const diff = getObjectDiff(
          //   snapshotRef.current ?? {},
          //   snapshot.context
          // );
          // log.info('store updated: saving state to IndexedDB:', diff);
          saveStateToIndexedDB(snapshot.context);
          snapshotRef.current = snapshot.context;
        }
      });

      return () => {
        // log.debug('unsubscribing from store updates');
        sub.unsubscribe();
      };
    }
  }, [store]);

  return (
    <StoreContext.Provider value={{ store, isReady: isSuccess }}>
      {children}
    </StoreContext.Provider>
  );
};
