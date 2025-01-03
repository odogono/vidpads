import { StoreContextType } from './types';

// Promise cache to prevent multiple loads
export const statePromiseCache = new Map<string, Promise<StoreContextType>>();

export const loadStateFromIndexedDB = async (): Promise<StoreContextType> => {
  // Use cached promise if it exists
  if (statePromiseCache.has('store')) {
    return statePromiseCache.get('store')!;
  }

  const promise = new Promise<StoreContextType>((resolve, reject) => {
    const request = indexedDB.open('app-store', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('store', 'readonly');
      const store = transaction.objectStore('store');
      const getRequest = store.get('state');

      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () =>
        resolve(getRequest.result as StoreContextType);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('store');
    };
  });

  statePromiseCache.set('store', promise);
  return promise;
};

export const saveStateToIndexedDB = async (
  state: StoreContextType
): Promise<void> => {
  const request = indexedDB.open('app-store', 1);

  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('store', 'readwrite');
      const store = transaction.objectStore('store');
      const putRequest = store.put(state, 'state');

      putRequest.onerror = () => reject(putRequest.error);
      putRequest.onsuccess = () => resolve();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('store');
    };
  });
};
