import { Suspense, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { StoreContext } from './context';
import { loadStateFromIndexedDB, saveStateToIndexedDB } from './storage';
import { createStore } from './store';
import type { StoreType } from './types';

const log = createLog('StoreProvider');

// Separate component to handle the async loading
const StoreLoader: React.FC<React.PropsWithChildren> = ({ children }) => {
  const storeRef = useRef<StoreType | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeStore = async () => {
      if (!storeRef.current) {
        log.debug('Initializing store');
        const state = await loadStateFromIndexedDB();
        log.debug('Creating store with loaded state:', state);
        storeRef.current = createStore(state);

        // const snapshot = storeRef.current.getSnapshot();
        // log.debug('Snapshot:', snapshot);
        // void saveStateToIndexedDB(snapshot.context);

        // setTimeout(() => {
        //   log.debug('Updating startTime');
        //   storeRef.current?.send({ type: 'updateStartTime' });
        // }, 1000);

        setIsInitialized(true);
      }
    };

    void initializeStore();
  }, []); // Run only once on mount

  useEffect(() => {
    // Subscribe to store changes and save to IndexedDB
    if (storeRef.current) {
      const sub = storeRef.current.subscribe((snapshot) => {
        log.info('Saving state to IndexedDB:', snapshot);
        void saveStateToIndexedDB(snapshot.context);
      });

      return () => {
        sub.unsubscribe();
      };
    }
  }, [isInitialized]); // Run when store is initialized

  // log.debug('StoreRef:', storeRef.current, 'Initialized:', isInitialized);

  if (!isInitialized) {
    return <LoadingFallback />;
  }

  return (
    <StoreContext.Provider value={storeRef.current!}>
      {children}
    </StoreContext.Provider>
  );
};

// Fallback component to show while loading
const LoadingFallback = () => <div>Loading...</div>;

// Main provider component that wraps the loader with Suspense
export const StoreProvider: React.FC<React.PropsWithChildren<object>> = ({
  children
}) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StoreLoader>{children}</StoreLoader>
    </Suspense>
  );
};
