import { createLog } from '@helpers/log';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { initialContext } from './store';
import { StoreContextType } from './types';

const log = createLog('store/storage');

const dbName = 'vid-wiz-store';
const dbVersion = 1;

export const useDBStore = () => {
  return useSuspenseQuery({
    // initialData: initialContext,
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
    log.debug('saving state to IndexedDB');
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
