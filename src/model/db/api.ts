import { createLog } from '@helpers/log';
import { StoreContextType } from '@model/store/types';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';

const log = createLog('db/api');

const dbName = 'vidpads';
const dbVersion = 1;

export const useDBStore = () => {
  return useSuspenseQuery({
    queryKey: ['store-state'],
    queryFn: loadStateFromIndexedDB
  });
};

export const useDBStoreUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveStateToIndexedDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-state'] });
    }
  });
};

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('store');

      db.createObjectStore('metadata', { keyPath: 'id' });

      db.createObjectStore('videoChunks', {
        keyPath: ['id', 'videoChunkIndex']
      });

      db.createObjectStore('images', { keyPath: 'id' });

      db.createObjectStore('thumbnails', { keyPath: 'id' });
    };
  });
};

export const loadStateFromIndexedDB = async (): Promise<StoreContextType> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    log.debug('loading state from IndexedDB');
    const transaction = db.transaction('store', 'readonly');
    const store = transaction.objectStore('store');
    const getRequest = store.get('state');

    getRequest.onerror = () => {
      log.error('Error loading state from IndexedDB:', getRequest.error);
      reject(getRequest.error);
    };
    getRequest.onsuccess = () => {
      const result = (getRequest.result as StoreContextType) ?? null;
      resolve(result);
    };

    transaction.oncomplete = () => {
      log.debug('state loaded from IndexedDB');
      db.close();
    };
  });
};

export const saveStateToIndexedDB = async (
  state: StoreContextType
): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('store', 'readwrite');
    const store = transaction.objectStore('store');
    const putRequest = store.put(state, 'state');

    putRequest.onerror = () => {
      log.error('Error saving state to IndexedDB:', putRequest.error);
      reject(putRequest.error);
    };
    putRequest.onsuccess = () => resolve();

    transaction.oncomplete = () => {
      log.debug('state saved to IndexedDB');
      db.close();
    };
  });
};
