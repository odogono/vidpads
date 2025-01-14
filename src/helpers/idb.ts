import { createLog } from '@helpers/log';

export interface RangeResult {
  key: IDBValidKey;
  value: unknown;
}

export type OnUpgradeHandler = (
  db: IDBDatabase,
  ev: IDBVersionChangeEvent
) => unknown;

const log = createLog('helpers/idb');

export const idbOpen = (
  name: string,
  version: number,
  onUpgrade?: OnUpgradeHandler
): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);

    if (onUpgrade) {
      request.onupgradeneeded = (evt: IDBVersionChangeEvent) => {
        const db = request.result;
        return onUpgrade(db, evt);
      };
    }

    request.onsuccess = () => {
      const db = request.result;

      db.onversionchange = () => {
        db.close();
      };
      return resolve(db);
    };

    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      log.warn('[openIDB][onblocked]', 'pending till unblocked');
  });

export const idbDeleteDB = (name: string) =>
  new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);

    request.onerror = (err) => {
      log.error('[deleteIDB]', 'Error deleting database.', err);
      return resolve(true);
    };

    request.onblocked = (e) => log.error('[deleteIDB]', 'request blocked', e);

    request.onsuccess = () => {
      return resolve(true);
    };
  });

export const idbCreateObjectStore = (
  db: IDBDatabase,
  name: string,
  options?: IDBObjectStoreParameters
) => {
  if (db.objectStoreNames.contains(name)) {
    return false;
  }
  db.createObjectStore(name, options);
  return true;
};

/**
 * Returns the key of the last record added
 * @param store
 */
export const idbLastKey = (
  store: IDBObjectStore
): Promise<IDBValidKey | undefined> =>
  new Promise((res, rej) => {
    const req = store.openCursor(null, 'prev');
    req.onsuccess = () => res(req.result ? req.result.key : undefined);
    req.onerror = (ev) => rej(ev);
  });

/**
 * Puts a record on the store
 * @param store
 * @param record
 */
export const idbPut = async (
  store: IDBObjectStore,
  value: unknown,
  key?: IDBValidKey
): Promise<Event> =>
  new Promise((res, rej) => {
    const req = store.put(value, key);
    req.onsuccess = (ev: Event) => res(ev);
    req.onerror = () => {
      rej(req.error);
    };
  });

export const idbGet = (
  idx: IDBIndex | IDBObjectStore,
  key: IDBValidKey
): Promise<unknown> =>
  new Promise((res, rej) => {
    const req = idx.get(key);
    req.onsuccess = () => res(req.result);
    req.onerror = (evt) => rej(evt);
  });

export const idbGetAll = (
  idx: IDBIndex | IDBObjectStore,
  key: IDBValidKey
): Promise<unknown[]> =>
  new Promise((res, rej) => {
    const req = idx.getAll(key);
    req.onsuccess = () => res(req.result);
    req.onerror = (evt) => rej(evt);
  });

export const idbGetAllKeys = (
  idx: IDBIndex | IDBObjectStore,
  query?: IDBValidKey
): Promise<IDBValidKey[]> =>
  new Promise((res, rej) => {
    const req = idx.getAllKeys(query);
    req.onsuccess = () => res(req.result);
    req.onerror = (evt) => rej(evt);
  });

/**
 * Deletes a record from the store
 * @param store
 * @param key
 */
export const idbDelete = (
  store: IDBObjectStore,
  key: IDBValidKey
): Promise<boolean> =>
  new Promise((res, rej) => {
    if (key === undefined) {
      return rej('invalid key');
    }
    const req = store.delete(key);
    req.onsuccess = () => res(true);
    req.onerror = (evt) => rej(evt);
  });

export const idbCount = (idx: IDBObjectStore): Promise<number> =>
  new Promise((res, rej) => {
    const req = idx.count();
    req.onsuccess = () => res(req.result);
    req.onerror = (evt) => rej(evt);
  });

export const idbGetRange = (
  store: IDBObjectStore | IDBIndex,
  key: IDBValidKey
): Promise<RangeResult[]> =>
  new Promise((res, rej) => {
    const req = store.openCursor(key);
    const result: RangeResult[] = [];
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        const { key, value } = cursor;
        result.push({ key, value });
        cursor.continue();
      } else {
        return res(result);
      }
    };
    req.onerror = (ev) => rej(ev);
  });
